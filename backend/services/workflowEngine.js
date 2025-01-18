const WorkflowTemplate = require('../models/WorkflowTemplate');
const WorkflowInstance = require('../models/WorkflowInstance');
const WorkflowStep = require('../models/WorkflowStep');
const File = require('../models/File');
const User = require('../models/User');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/emailService');
const { logWorkflowEvent } = require('../utils/auditLogger');

class WorkflowEngine {
  async startWorkflow(fileId, templateId, initiator) {
    try {
      const template = await WorkflowTemplate.findByPk(templateId);
      if (!template) {
        throw new Error('Workflow template not found');
      }

      const file = await File.findByPk(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // Create workflow instance
      const workflow = await WorkflowInstance.create({
        templateId,
        fileId,
        status: 'active',
        startedAt: new Date(),
        metadata: {
          initiator,
          templateName: template.name
        }
      });

      // Initialize first steps
      await this.initializeSteps(workflow, template);

      await logWorkflowEvent(workflow.id, 'workflow_started', {
        initiator,
        templateId,
        fileId
      });

      return workflow;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  }

  async initializeSteps(workflow, template) {
    try {
      const initialSteps = template.steps.filter(step => 
        !step.dependencies || step.dependencies.length === 0
      );

      for (const stepConfig of initialSteps) {
        await this.createStep(workflow, stepConfig);
      }
    } catch (error) {
      console.error('Error initializing steps:', error);
      throw error;
    }
  }

  async createStep(workflow, stepConfig) {
    try {
      const assignedUsers = await this.resolveAssignees(stepConfig.assignTo);
      const deadline = await this.calculateDeadline(stepConfig.deadline);

      const step = await WorkflowStep.create({
        workflowId: workflow.id,
        stepId: stepConfig.id,
        type: stepConfig.type,
        status: 'pending',
        assignedTo: assignedUsers,
        deadline,
        metadata: {
          name: stepConfig.name,
          parallel: stepConfig.parallel,
          requiredApprovals: stepConfig.requiredApprovals,
          priority: stepConfig.priority
        }
      });

      // Send notifications
      await this.sendStepNotifications(step, stepConfig, 'step_created');

      return step;
    } catch (error) {
      console.error('Error creating step:', error);
      throw error;
    }
  }

  async resolveAssignees(assignConfig) {
    const { type, value } = assignConfig;
    let users = [];

    switch (type) {
      case 'user':
        users = Array.isArray(value) ? value : [value];
        break;

      case 'role':
        const roleUsers = await User.findAll({
          where: { role: value }
        });
        users = roleUsers.map(user => user.id);
        break;

      case 'department':
        const deptUsers = await User.findAll({
          where: { department: value }
        });
        users = deptUsers.map(user => user.id);
        break;

      case 'dynamic':
        // Implement dynamic assignment logic
        break;
    }

    return users;
  }

  async calculateDeadline(deadlineConfig) {
    const { type, value, formula } = deadlineConfig;
    const now = new Date();

    if (type === 'fixed') {
      const deadline = new Date(now);
      deadline.setDate(deadline.getDate() + value);
      return deadline;
    }

    if (type === 'dynamic') {
      // Implement dynamic deadline calculation based on formula
      return null;
    }

    return null;
  }

  async processStep(stepId, userId, action, data = {}) {
    try {
      const step = await WorkflowStep.findByPk(stepId, {
        include: [{
          model: WorkflowInstance,
          include: [WorkflowTemplate]
        }]
      });

      if (!step) {
        throw new Error('Step not found');
      }

      const { remarks, formData } = data;
      const decision = {
        userId,
        action,
        remarks,
        timestamp: new Date()
      };

      // Update step with decision
      const decisions = [...step.decisions, decision];
      const stepConfig = step.WorkflowInstance.WorkflowTemplate.steps
        .find(s => s.id === step.stepId);

      // Check if step is complete
      const isComplete = this.checkStepCompletion(decisions, stepConfig);

      if (isComplete) {
        await this.completeStep(step, decisions, formData);
        await this.progressWorkflow(step.WorkflowInstance);
      } else {
        await step.update({
          decisions,
          formData: { ...step.formData, ...formData }
        });
      }

      await logWorkflowEvent(step.workflowId, 'step_processed', {
        stepId,
        userId,
        action,
        isComplete
      });

      return step;
    } catch (error) {
      console.error('Error processing step:', error);
      throw error;
    }
  }

  checkStepCompletion(decisions, stepConfig) {
    if (stepConfig.parallel) {
      const approvals = decisions.filter(d => d.action === 'approve').length;
      return approvals >= stepConfig.requiredApprovals;
    }

    return decisions.length >= stepConfig.assignTo.value.length;
  }

  async completeStep(step, decisions, formData) {
    try {
      await step.update({
        status: 'completed',
        completedAt: new Date(),
        decisions,
        formData
      });

      await this.sendStepNotifications(step, step.metadata, 'step_completed');
    } catch (error) {
      console.error('Error completing step:', error);
      throw error;
    }
  }

  async progressWorkflow(workflow) {
    try {
      const template = await WorkflowTemplate.findByPk(workflow.templateId);
      const completedSteps = await WorkflowStep.findAll({
        where: {
          workflowId: workflow.id,
          status: 'completed'
        }
      });

      const completedStepIds = completedSteps.map(step => step.stepId);
      const nextSteps = template.steps.filter(step => {
        if (!step.dependencies) return false;
        return step.dependencies.every(dep => completedStepIds.includes(dep));
      });

      for (const stepConfig of nextSteps) {
        // Check if step already exists
        const existingStep = await WorkflowStep.findOne({
          where: {
            workflowId: workflow.id,
            stepId: stepConfig.id
          }
        });

        if (!existingStep) {
          await this.createStep(workflow, stepConfig);
        }
      }

      // Check if workflow is complete
      const allSteps = await WorkflowStep.findAll({
        where: { workflowId: workflow.id }
      });

      const isComplete = allSteps.every(step => 
        step.status === 'completed' || step.status === 'skipped'
      );

      if (isComplete) {
        await this.completeWorkflow(workflow);
      }
    } catch (error) {
      console.error('Error progressing workflow:', error);
      throw error;
    }
  }

  async completeWorkflow(workflow) {
    try {
      await workflow.update({
        status: 'completed',
        completedAt: new Date()
      });

      await logWorkflowEvent(workflow.id, 'workflow_completed', {
        templateId: workflow.templateId,
        fileId: workflow.fileId
      });

      // Send completion notifications
      const template = await WorkflowTemplate.findByPk(workflow.templateId);
      if (template.notifications?.completion) {
        await this.sendWorkflowNotifications(workflow, template, 'workflow_completed');
      }
    } catch (error) {
      console.error('Error completing workflow:', error);
      throw error;
    }
  }

  async sendStepNotifications(step, stepConfig, event) {
    try {
      const notifications = stepConfig.notifications?.filter(n => n.event === event);
      if (!notifications?.length) return;

      for (const notification of notifications) {
        const recipients = await this.resolveNotificationRecipients(notification.recipients);
        for (const recipient of recipients) {
          await sendEmail({
            to: recipient.email,
            subject: `Workflow Step ${event} - ${stepConfig.name}`,
            template: notification.template,
            context: {
              recipient: recipient.name,
              step: stepConfig.name,
              workflow: step.WorkflowInstance.metadata.templateName,
              action: event,
              deadline: step.deadline
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending step notifications:', error);
    }
  }

  async sendWorkflowNotifications(workflow, template, event) {
    try {
      const notifications = template.notifications?.filter(n => n.event === event);
      if (!notifications?.length) return;

      for (const notification of notifications) {
        const recipients = await this.resolveNotificationRecipients(notification.recipients);
        for (const recipient of recipients) {
          await sendEmail({
            to: recipient.email,
            subject: `Workflow ${event} - ${template.name}`,
            template: notification.template,
            context: {
              recipient: recipient.name,
              workflow: template.name,
              action: event,
              completedAt: workflow.completedAt
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending workflow notifications:', error);
    }
  }

  async resolveNotificationRecipients(recipientConfig) {
    const { type, value } = recipientConfig;
    let recipients = [];

    switch (type) {
      case 'user':
        recipients = await User.findAll({
          where: { id: Array.isArray(value) ? value : [value] }
        });
        break;

      case 'role':
        recipients = await User.findAll({
          where: { role: value }
        });
        break;

      case 'department':
        recipients = await User.findAll({
          where: { department: value }
        });
        break;
    }

    return recipients;
  }
}

module.exports = new WorkflowEngine();
