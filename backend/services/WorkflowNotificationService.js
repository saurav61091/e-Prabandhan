const { Op } = require('sequelize');
const WorkflowNotification = require('../models/WorkflowNotification');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { formatDistanceToNow } = require('date-fns');

class WorkflowNotificationService {
  async createNotification(data) {
    try {
      const notification = await WorkflowNotification.create(data);
      
      if (notification.actionRequired) {
        await this.sendEmailNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async createTaskAssignedNotification(step, user) {
    return this.createNotification({
      workflowId: step.workflowId,
      stepId: step.id,
      userId: user.id,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned to the task "${step.metadata.name}" in workflow "${step.workflow.template.name}"`,
      priority: 'high',
      actionRequired: true,
      actionType: 'view_task',
      actionUrl: `/workflow/${step.workflowId}/step/${step.id}`
    });
  }

  async createTaskCompletedNotification(step, completedBy) {
    const assignedUsers = step.assignedTo.filter(userId => userId !== completedBy.id);
    
    for (const userId of assignedUsers) {
      await this.createNotification({
        workflowId: step.workflowId,
        stepId: step.id,
        userId,
        type: 'task_completed',
        title: 'Task Completed',
        message: `Task "${step.metadata.name}" has been completed by ${completedBy.name}`,
        priority: 'medium',
        actionRequired: false,
        actionType: 'view_task',
        actionUrl: `/workflow/${step.workflowId}/step/${step.id}`
      });
    }
  }

  async createSLAWarningNotification(step, daysRemaining) {
    for (const userId of step.assignedTo) {
      await this.createNotification({
        workflowId: step.workflowId,
        stepId: step.id,
        userId,
        type: 'sla_warning',
        title: 'SLA Warning',
        message: `Task "${step.metadata.name}" is due in ${daysRemaining} days`,
        priority: 'urgent',
        actionRequired: true,
        actionType: 'view_task',
        actionUrl: `/workflow/${step.workflowId}/step/${step.id}`
      });
    }
  }

  async createSLABreachNotification(step) {
    const supervisors = await User.findAll({
      where: {
        role: 'supervisor',
        department: step.workflow.metadata.department
      }
    });

    for (const supervisor of supervisors) {
      await this.createNotification({
        workflowId: step.workflowId,
        stepId: step.id,
        userId: supervisor.id,
        type: 'sla_breach',
        title: 'SLA Breach Alert',
        message: `Task "${step.metadata.name}" has breached its SLA deadline`,
        priority: 'urgent',
        actionRequired: true,
        actionType: 'view_task',
        actionUrl: `/workflow/${step.workflowId}/step/${step.id}`
      });
    }
  }

  async createWorkflowCompletedNotification(workflow, initiator) {
    const stakeholders = await this.getWorkflowStakeholders(workflow);
    
    for (const userId of stakeholders) {
      await this.createNotification({
        workflowId: workflow.id,
        userId,
        type: 'workflow_completed',
        title: 'Workflow Completed',
        message: `Workflow "${workflow.metadata.templateName}" has been completed`,
        priority: 'medium',
        actionRequired: false,
        actionType: 'view_workflow',
        actionUrl: `/workflow/${workflow.id}`
      });
    }
  }

  async createCommentNotification(comment, mentionedUsers = []) {
    const step = await comment.getStep();
    const author = await comment.getAuthor();
    
    const recipients = new Set([
      ...step.assignedTo,
      ...mentionedUsers.map(user => user.id)
    ]);

    for (const userId of recipients) {
      if (userId === author.id) continue;

      await this.createNotification({
        workflowId: step.workflowId,
        stepId: step.id,
        userId,
        type: 'comment_added',
        title: 'New Comment',
        message: `${author.name} commented on task "${step.metadata.name}"`,
        priority: 'medium',
        actionRequired: mentionedUsers.some(user => user.id === userId),
        actionType: 'view_comment',
        actionUrl: `/workflow/${step.workflowId}/step/${step.id}?comment=${comment.id}`
      });
    }
  }

  async getWorkflowStakeholders(workflow) {
    const steps = await workflow.getSteps();
    const stakeholders = new Set();

    // Add workflow initiator
    stakeholders.add(workflow.metadata.initiator);

    // Add all users assigned to any step
    steps.forEach(step => {
      step.assignedTo.forEach(userId => stakeholders.add(userId));
    });

    return Array.from(stakeholders);
  }

  async getUserNotifications(userId, options = {}) {
    const {
      limit = 10,
      offset = 0,
      unreadOnly = false,
      type = null,
      priority = null
    } = options;

    const where = { userId };
    if (unreadOnly) where.read = false;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    return await WorkflowNotification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: WorkflowInstance,
          as: 'workflow',
          include: [{ model: WorkflowTemplate, as: 'template' }]
        },
        {
          model: WorkflowStep,
          as: 'step'
        }
      ]
    });
  }

  async markAsRead(notificationId, userId) {
    const notification = await WorkflowNotification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({
      read: true,
      readAt: new Date()
    });

    return notification;
  }

  async markAllAsRead(userId, types = null) {
    const where = { userId, read: false };
    if (types) where.type = types;

    await WorkflowNotification.update(
      { read: true, readAt: new Date() },
      { where }
    );
  }

  async getUnreadCount(userId) {
    return await WorkflowNotification.count({
      where: { userId, read: false }
    });
  }

  async sendEmailNotification(notification) {
    try {
      const user = await User.findByPk(notification.userId);
      if (!user || !user.email) return;

      const emailTemplate = this.getEmailTemplate(notification.type);
      
      await sendEmail({
        to: user.email,
        subject: notification.title,
        template: emailTemplate,
        context: {
          userName: user.name,
          title: notification.title,
          message: notification.message,
          actionUrl: `${process.env.APP_URL}${notification.actionUrl}`,
          priority: notification.priority
        }
      });

      await notification.update({
        emailSent: true,
        emailSentAt: new Date()
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  getEmailTemplate(notificationType) {
    const templates = {
      task_assigned: 'task-assigned',
      sla_warning: 'sla-warning',
      sla_breach: 'sla-breach',
      workflow_completed: 'workflow-completed',
      comment_added: 'comment-added'
    };

    return templates[notificationType] || 'default';
  }

  async cleanupOldNotifications(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    await WorkflowNotification.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
        read: true
      }
    });
  }
}

module.exports = new WorkflowNotificationService();
