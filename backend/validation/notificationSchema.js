const Joi = require('joi');

const notificationSchema = {
  // Schema for department notifications
  departmentNotification: Joi.object({
    type: Joi.string().valid(
      'announcement',
      'alert',
      'reminder',
      'policy_update',
      'meeting',
      'event'
    ).required(),
    title: Joi.string().min(3).max(100).required(),
    message: Joi.string().min(10).max(1000).required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('low'),
    metadata: Joi.object().allow(null),
    actionUrl: Joi.string().uri().allow(null),
    expiresAt: Joi.date().greater('now').allow(null),
    channel: Joi.string().valid('in_app', 'email', 'push', 'sms').default('in_app')
  }),

  // Schema for notification preferences
  preferences: Joi.object({
    emailNotifications: Joi.boolean().default(true),
    pushNotifications: Joi.boolean().default(true),
    smsNotifications: Joi.boolean().default(false),
    dailyDigest: Joi.boolean().default(true),
    taskReminders: Joi.boolean().default(true),
    deadlineAlerts: Joi.boolean().default(true),
    securityAlerts: Joi.boolean().default(true),
    fileUpdates: Joi.boolean().default(true),
    commentMentions: Joi.boolean().default(true),
    workflowUpdates: Joi.boolean().default(true),
    quietHours: Joi.object({
      enabled: Joi.boolean().default(false),
      start: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('22:00'),
      end: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('07:00'),
      timezone: Joi.string().default('UTC')
    }).default(),
    notificationTypes: Joi.object({
      file_shared: Joi.boolean().default(true),
      file_accessed: Joi.boolean().default(true),
      comment_added: Joi.boolean().default(true),
      task_assigned: Joi.boolean().default(true),
      task_updated: Joi.boolean().default(true),
      deadline_approaching: Joi.boolean().default(true),
      security_alert: Joi.boolean().default(true),
      system_notification: Joi.boolean().default(true),
      mention: Joi.boolean().default(true),
      approval_request: Joi.boolean().default(true),
      approval_status: Joi.boolean().default(true)
    }).default()
  }).default(),

  // Schema for updating notification status
  updateStatus: Joi.object({
    status: Joi.string().valid('read', 'archived').required()
  }),

  // Schema for bulk notifications
  bulkNotifications: Joi.array().items(
    Joi.object({
      userId: Joi.string().uuid().required(),
      type: Joi.string().required(),
      title: Joi.string().min(3).max(100).required(),
      message: Joi.string().min(10).max(1000).required(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('low'),
      metadata: Joi.object().allow(null),
      actionUrl: Joi.string().uri().allow(null),
      expiresAt: Joi.date().greater('now').allow(null),
      channel: Joi.string().valid('in_app', 'email', 'push', 'sms').default('in_app')
    })
  ).min(1).max(100)
};

module.exports = {
  notificationSchema
};
