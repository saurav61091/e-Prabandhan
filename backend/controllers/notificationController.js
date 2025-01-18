const User = require('../models/User');
const Task = require('../models/Task');
const Workflow = require('../models/Workflow');
const File = require('../models/File');
const EmailService = require('../services/emailService');
const NotificationService = require('../services/notificationService');
const createError = require('http-errors');
const { validateSchema } = require('../utils/validation');
const { notificationSchema } = require('../validation/notificationSchema');
const { Op } = require('sequelize');

// Get user's notifications with filtering and pagination
const getUserNotifications = async (req, res) => {
  try {
    const {
      status,
      type,
      priority,
      startDate,
      endDate,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query;

    const result = await NotificationService.getUserNotifications(
      req.user.id,
      {
        status,
        type,
        priority,
        startDate,
        endDate,
        search
      },
      {
        page,
        limit,
        sortBy,
        sortOrder
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving notifications'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId: req.user.id
      }
    });

    if (!notification) {
      throw createError(404, 'Notification not found');
    }

    await notification.markAsRead();

    res.json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error marking notification as read'
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const count = await Notification.markAllAsRead(req.user.id);

    res.json({
      message: `Marked ${count} notifications as read`
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error marking notifications as read'
    });
  }
};

// Archive notification
const archiveNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId: req.user.id
      }
    });

    if (!notification) {
      throw createError(404, 'Notification not found');
    }

    await notification.archive();

    res.json({
      message: 'Notification archived'
    });
  } catch (error) {
    console.error('Archive notification error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error archiving notification'
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const stats = await NotificationService.getNotificationStats(req.user.id);

    res.json(stats);
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving notification statistics'
    });
  }
};

// Send notification to department
const sendDepartmentNotification = async (req, res) => {
  try {
    if (!req.user.role.includes('manager')) {
      throw createError(403, 'Only managers can send department notifications');
    }

    const notification = await validateSchema(
      notificationSchema.departmentNotification,
      req.body
    );

    await NotificationService.sendDepartmentNotification({
      ...notification,
      departmentId: req.user.departmentId
    });

    res.json({
      message: 'Department notification sent successfully'
    });
  } catch (error) {
    console.error('Send department notification error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error sending department notification'
    });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const preferences = await validateSchema(
      notificationSchema.preferences,
      req.body
    );

    await User.update(
      { notificationPreferences: preferences },
      { where: { id: req.user.id } }
    );

    res.json({
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error updating notification preferences'
    });
  }
};

// Send task reminders
const sendTaskReminders = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.lt]: tomorrow,
          [Op.gt]: new Date()
        },
        status: {
          [Op.notIn]: ['completed', 'cancelled']
        },
        reminderSent: false
      },
      include: [{
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email']
      }]
    });

    for (const task of tasks) {
      await NotificationService.createNotification({
        userId: task.assignee.id,
        type: 'task_reminder',
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due ${task.dueDate}`,
        priority: 'high',
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.dueDate
        },
        actionUrl: `/tasks/${task.id}`,
        channel: 'email'
      });

      await task.update({ reminderSent: true });
    }

    res.json({
      message: `Sent ${tasks.length} task reminders`
    });
  } catch (error) {
    console.error('Send task reminders error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error sending task reminders'
    });
  }
};

// Send daily digest
const sendDailyDigest = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        isActive: true,
        notificationPreferences: {
          dailyDigest: true
        }
      }
    });

    for (const user of users) {
      const digest = await generateUserDigest(user.id);
      
      await NotificationService.createNotification({
        userId: user.id,
        type: 'system_notification',
        title: 'Daily Digest',
        message: 'Your daily activity summary is ready',
        priority: 'low',
        metadata: digest,
        channel: 'email'
      });
    }

    res.json({
      message: `Sent daily digest to ${users.length} users`
    });
  } catch (error) {
    console.error('Send daily digest error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error sending daily digest'
    });
  }
};

// Generate user-specific digest data
const generateUserDigest = async (userId) => {
  const pendingTasks = await Task.findAll({
    where: {
      assignedTo: userId,
      status: {
        [Op.notIn]: ['completed', 'cancelled']
      }
    },
    limit: 5
  });

  const pendingApprovals = await Workflow.findAll({
    where: {
      status: 'active',
      'steps.approver': userId,
      'steps.status': null
    },
    limit: 5
  });

  const recentFiles = await File.findAll({
    where: {
      [Op.or]: [
        { createdBy: userId },
        { 'sharedWith': { [Op.contains]: [userId] } }
      ]
    },
    order: [['updatedAt', 'DESC']],
    limit: 5
  });

  return {
    pendingTasks,
    pendingApprovals,
    recentFiles
  };
};

// Send notification for new task assignment
const notifyTaskAssignment = async (task) => {
  try {
    const assignee = await User.findByPk(task.assignedTo);
    if (assignee) {
      await EmailService.sendTaskAssignment(assignee, task);
    }
  } catch (error) {
    console.error('Error sending task assignment notification:', error);
  }
};

// Send notification for workflow approval request
const notifyWorkflowApproval = async (workflow) => {
  try {
    const currentStep = workflow.steps[workflow.currentStep];
    const approver = await User.findByPk(currentStep.approver);
    if (approver) {
      await EmailService.sendWorkflowApprovalRequest(approver, workflow);
    }
  } catch (error) {
    console.error('Error sending workflow approval notification:', error);
  }
};

// Send notification for file status update
const notifyFileStatusUpdate = async (file) => {
  try {
    const owner = await User.findByPk(file.createdBy);
    if (owner) {
      await EmailService.sendFileStatusUpdate(owner, file);
    }

    // Notify shared users if any
    if (file.sharedWith && file.sharedWith.length > 0) {
      const sharedUsers = await User.findAll({
        where: {
          id: {
            [Op.in]: file.sharedWith
          }
        }
      });

      for (const user of sharedUsers) {
        await EmailService.sendFileStatusUpdate(user, file);
      }
    }
  } catch (error) {
    console.error('Error sending file status update notification:', error);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getNotificationStats,
  sendDepartmentNotification,
  updateNotificationPreferences,
  sendTaskReminders,
  sendDailyDigest,
  notifyTaskAssignment,
  notifyWorkflowApproval,
  notifyFileStatusUpdate
};
