const cron = require('node-cron');
const WorkflowInstance = require('../models/WorkflowInstance');
const WorkflowStep = require('../models/WorkflowStep');
const WorkflowTemplate = require('../models/WorkflowTemplate');
const User = require('../models/User');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/emailService');
const { logJobExecution } = require('../utils/auditLogger');

// Process SLA checks and send warnings daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('Starting workflow SLA check...');
    await logJobExecution('workflow-sla', 'start');

    const activeSteps = await WorkflowStep.findAll({
      where: {
        status: { [Op.in]: ['pending', 'in_progress'] },
        deadline: { [Op.not]: null }
      },
      include: [
        {
          model: WorkflowInstance,
          include: [WorkflowTemplate]
        }
      ]
    });

    for (const step of activeSteps) {
      try {
        const now = new Date();
        const deadline = new Date(step.deadline);
        const warningThreshold = step.WorkflowInstance.WorkflowTemplate.sla.warningThreshold;
        const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        // Send warning if approaching deadline
        if (daysUntilDeadline <= warningThreshold && !step.metadata.warningsSent) {
          const assignees = await User.findAll({
            where: {
              id: { [Op.in]: step.assignedTo }
            }
          });

          for (const assignee of assignees) {
            await sendEmail({
              to: assignee.email,
              subject: `Workflow Step Deadline Approaching - ${step.metadata.name}`,
              template: 'workflowDeadlineWarning',
              context: {
                assignee: assignee.name,
                step: step.metadata.name,
                workflow: step.WorkflowInstance.WorkflowTemplate.name,
                daysRemaining: daysUntilDeadline,
                deadline: step.deadline
              }
            });
          }

          await step.update({
            metadata: {
              ...step.metadata,
              warningsSent: true,
              warningSentAt: now
            }
          });
        }

        // Check for overdue steps
        if (now > deadline && !step.escalated) {
          await escalateStep(step);
        }
      } catch (error) {
        console.error(`Error processing step ${step.id}:`, error);
      }
    }

    await logJobExecution('workflow-sla', 'complete');
    console.log('Workflow SLA check completed');
  } catch (error) {
    console.error('Error in workflow SLA job:', error);
    await logJobExecution('workflow-sla', 'error', { error: error.message });
  }
});

// Process workflow reminders daily at 4 AM
cron.schedule('0 4 * * *', async () => {
  try {
    console.log('Starting workflow reminder processing...');
    await logJobExecution('workflow-reminders', 'start');

    const activeSteps = await WorkflowStep.findAll({
      where: {
        status: { [Op.in]: ['pending', 'in_progress'] },
        remindersSent: { [Op.lt]: 3 }, // Maximum 3 reminders
        [Op.or]: [
          { lastReminderSent: null },
          {
            lastReminderSent: {
              [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last reminder > 24 hours ago
            }
          }
        ]
      },
      include: [
        {
          model: WorkflowInstance,
          include: [WorkflowTemplate]
        }
      ]
    });

    for (const step of activeSteps) {
      try {
        const assignees = await User.findAll({
          where: {
            id: { [Op.in]: step.assignedTo }
          }
        });

        for (const assignee of assignees) {
          await sendEmail({
            to: assignee.email,
            subject: `REMINDER: Pending Workflow Step - ${step.metadata.name}`,
            template: 'workflowStepReminder',
            context: {
              assignee: assignee.name,
              step: step.metadata.name,
              workflow: step.WorkflowInstance.WorkflowTemplate.name,
              deadline: step.deadline,
              daysPending: Math.ceil((new Date() - step.createdAt) / (1000 * 60 * 60 * 24))
            }
          });
        }

        await step.update({
          remindersSent: step.remindersSent + 1,
          lastReminderSent: new Date()
        });
      } catch (error) {
        console.error(`Error processing reminder for step ${step.id}:`, error);
      }
    }

    await logJobExecution('workflow-reminders', 'complete');
    console.log('Workflow reminder processing completed');
  } catch (error) {
    console.error('Error in workflow reminder job:', error);
    await logJobExecution('workflow-reminders', 'error', { error: error.message });
  }
});

// Escalate overdue steps
async function escalateStep(step) {
  try {
    const workflow = step.WorkflowInstance;
    const template = workflow.WorkflowTemplate;

    // Find department head
    const deptHead = await User.findOne({
      where: {
        department: template.department,
        role: 'department_head'
      }
    });

    if (deptHead) {
      await sendEmail({
        to: deptHead.email,
        subject: `ESCALATION: Overdue Workflow Step - ${step.metadata.name}`,
        template: 'workflowStepEscalation',
        context: {
          manager: deptHead.name,
          step: step.metadata.name,
          workflow: template.name,
          deadline: step.deadline,
          daysOverdue: Math.ceil((new Date() - step.deadline) / (1000 * 60 * 60 * 24))
        }
      });
    }

    // Notify workflow initiator
    const initiator = await User.findByPk(workflow.metadata.initiator);
    if (initiator) {
      await sendEmail({
        to: initiator.email,
        subject: `ESCALATION: Workflow Step Overdue - ${step.metadata.name}`,
        template: 'workflowStepEscalation',
        context: {
          initiator: initiator.name,
          step: step.metadata.name,
          workflow: template.name,
          deadline: step.deadline,
          daysOverdue: Math.ceil((new Date() - step.deadline) / (1000 * 60 * 60 * 24))
        }
      });
    }

    // Auto-reassign if configured
    if (template.sla?.autoReassign) {
      const backupAssignees = template.sla.backupAssignees?.[step.type] || [];
      if (backupAssignees.length > 0) {
        await step.update({
          assignedTo: backupAssignees,
          metadata: {
            ...step.metadata,
            autoReassigned: true,
            previousAssignees: step.assignedTo
          }
        });

        // Notify new assignees
        const newAssignees = await User.findAll({
          where: {
            id: { [Op.in]: backupAssignees }
          }
        });

        for (const assignee of newAssignees) {
          await sendEmail({
            to: assignee.email,
            subject: `URGENT: Workflow Step Auto-Reassigned - ${step.metadata.name}`,
            template: 'workflowStepReassigned',
            context: {
              assignee: assignee.name,
              step: step.metadata.name,
              workflow: template.name,
              deadline: step.deadline,
              reason: 'Auto-reassigned due to SLA breach'
            }
          });
        }
      }
    }

    await step.update({
      escalated: true,
      escalatedAt: new Date(),
      escalatedTo: deptHead ? [deptHead.id] : []
    });
  } catch (error) {
    console.error(`Error escalating step ${step.id}:`, error);
    throw error;
  }
}
