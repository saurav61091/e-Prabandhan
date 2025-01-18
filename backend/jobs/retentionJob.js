const cron = require('node-cron');
const { processRetention, processRetentionWarnings } = require('../controllers/retentionController');
const { logJobExecution } = require('../utils/auditLogger');

// Process retention policies daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Starting retention policy processing...');
    await logJobExecution('retention-process', 'start');
    await processRetention();
    await logJobExecution('retention-process', 'complete');
    console.log('Retention policy processing completed');
  } catch (error) {
    console.error('Error in retention policy job:', error);
    await logJobExecution('retention-process', 'error', { error: error.message });
  }
});

// Check for retention warnings daily at 1 AM
cron.schedule('0 1 * * *', async () => {
  try {
    console.log('Starting retention warning processing...');
    await logJobExecution('retention-warnings', 'start');
    await processRetentionWarnings();
    await logJobExecution('retention-warnings', 'complete');
    console.log('Retention warning processing completed');
  } catch (error) {
    console.error('Error in retention warning job:', error);
    await logJobExecution('retention-warnings', 'error', { error: error.message });
  }
});

// Process retention approval reminders daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('Starting retention approval reminder processing...');
    await logJobExecution('retention-reminders', 'start');
    
    const overdueApprovals = await RetentionApproval.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [Op.lt]: new Date()
        },
        remindersSent: {
          [Op.lt]: 3 // Maximum 3 reminders
        },
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
          model: File,
          attributes: ['fileNumber', 'name']
        },
        {
          model: RetentionPolicy,
          attributes: ['name', 'action', 'approvers']
        }
      ]
    });

    for (const approval of overdueApprovals) {
      try {
        const approvers = await User.findAll({
          where: {
            id: { [Op.in]: approval.RetentionPolicy.approvers }
          }
        });

        for (const approver of approvers) {
          await sendEmail({
            to: approver.email,
            subject: `REMINDER: Retention Approval Required - ${approval.File.fileNumber}`,
            template: 'retentionApprovalReminder',
            context: {
              approver: approver.name,
              file: approval.File.fileNumber,
              fileName: approval.File.name,
              policy: approval.RetentionPolicy.name,
              action: approval.RetentionPolicy.action,
              dueDate: approval.dueDate,
              daysOverdue: Math.ceil((new Date() - approval.dueDate) / (1000 * 60 * 60 * 24)),
              approvalLink: `/retention-approval/${approval.id}`
            }
          });
        }

        await approval.update({
          remindersSent: approval.remindersSent + 1,
          lastReminderSent: new Date()
        });
      } catch (error) {
        console.error(`Error processing reminder for approval ${approval.id}:`, error);
      }
    }

    await logJobExecution('retention-reminders', 'complete');
    console.log('Retention approval reminder processing completed');
  } catch (error) {
    console.error('Error in retention reminder job:', error);
    await logJobExecution('retention-reminders', 'error', { error: error.message });
  }
});

// Auto-escalate overdue approvals weekly on Sunday at 3 AM
cron.schedule('0 3 * * 0', async () => {
  try {
    console.log('Starting retention approval escalation...');
    await logJobExecution('retention-escalation', 'start');

    const overdueApprovals = await RetentionApproval.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // More than 7 days overdue
        },
        remindersSent: {
          [Op.gte]: 3 // All reminders sent
        }
      },
      include: [
        {
          model: File,
          attributes: ['fileNumber', 'name', 'department']
        },
        {
          model: RetentionPolicy,
          attributes: ['name', 'action', 'approvers']
        }
      ]
    });

    for (const approval of overdueApprovals) {
      try {
        // Find department head
        const deptHead = await User.findOne({
          where: {
            department: approval.File.department,
            role: 'department_head'
          }
        });

        if (deptHead) {
          await sendEmail({
            to: deptHead.email,
            subject: `ESCALATION: Overdue Retention Approval - ${approval.File.fileNumber}`,
            template: 'retentionApprovalEscalation',
            context: {
              manager: deptHead.name,
              file: approval.File.fileNumber,
              fileName: approval.File.name,
              policy: approval.RetentionPolicy.name,
              action: approval.RetentionPolicy.action,
              dueDate: approval.dueDate,
              daysOverdue: Math.ceil((new Date() - approval.dueDate) / (1000 * 60 * 60 * 24)),
              approvalLink: `/retention-approval/${approval.id}`
            }
          });
        }

        // Also notify system administrators
        const admins = await User.findAll({
          where: {
            role: 'admin'
          }
        });

        for (const admin of admins) {
          await sendEmail({
            to: admin.email,
            subject: `ESCALATION: Overdue Retention Approval - ${approval.File.fileNumber}`,
            template: 'retentionApprovalEscalation',
            context: {
              admin: admin.name,
              file: approval.File.fileNumber,
              fileName: approval.File.name,
              policy: approval.RetentionPolicy.name,
              action: approval.RetentionPolicy.action,
              dueDate: approval.dueDate,
              daysOverdue: Math.ceil((new Date() - approval.dueDate) / (1000 * 60 * 60 * 24)),
              approvalLink: `/retention-approval/${approval.id}`
            }
          });
        }
      } catch (error) {
        console.error(`Error processing escalation for approval ${approval.id}:`, error);
      }
    }

    await logJobExecution('retention-escalation', 'complete');
    console.log('Retention approval escalation completed');
  } catch (error) {
    console.error('Error in retention escalation job:', error);
    await logJobExecution('retention-escalation', 'error', { error: error.message });
  }
});
