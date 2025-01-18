const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowNotification = sequelize.define('WorkflowNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workflowId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'WorkflowInstances',
      key: 'id'
    }
  },
  stepId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'WorkflowSteps',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'task_assigned',
      'task_completed',
      'task_reminder',
      'task_escalated',
      'task_reassigned',
      'workflow_started',
      'workflow_completed',
      'workflow_cancelled',
      'comment_added',
      'mention',
      'sla_warning',
      'sla_breach'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  actionType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['workflowId']
    },
    {
      fields: ['stepId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['read']
    }
  ]
});

// Define associations
WorkflowNotification.associate = (models) => {
  WorkflowNotification.belongsTo(models.WorkflowInstance, {
    foreignKey: 'workflowId',
    as: 'workflow'
  });

  WorkflowNotification.belongsTo(models.WorkflowStep, {
    foreignKey: 'stepId',
    as: 'step'
  });

  WorkflowNotification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// Instance methods
WorkflowNotification.prototype.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  await this.save();
};

// Static methods
WorkflowNotification.createTaskAssignedNotification = async function(step, user) {
  return await this.create({
    workflowId: step.workflowId,
    stepId: step.id,
    userId: user.id,
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: `You have been assigned to the task "${step.metadata.name}" in workflow "${step.workflow.template.name}"`,
    priority: 'high',
    actionRequired: true,
    actionType: 'view_task',
    actionUrl: `/workflow/${step.workflowId}`
  });
};

WorkflowNotification.createSLAWarningNotification = async function(step, user, daysRemaining) {
  return await this.create({
    workflowId: step.workflowId,
    stepId: step.id,
    userId: user.id,
    type: 'sla_warning',
    title: 'SLA Warning',
    message: `Task "${step.metadata.name}" is due in ${daysRemaining} days`,
    priority: 'urgent',
    actionRequired: true,
    actionType: 'view_task',
    actionUrl: `/workflow/${step.workflowId}`
  });
};

WorkflowNotification.getUserNotifications = async function(userId, options = {}) {
  const { limit = 10, offset = 0, unreadOnly = false, type = null } = options;

  const where = { userId };
  if (unreadOnly) where.read = false;
  if (type) where.type = type;

  return await this.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: sequelize.models.WorkflowInstance,
        as: 'workflow',
        include: [
          {
            model: sequelize.models.WorkflowTemplate,
            as: 'template'
          }
        ]
      },
      {
        model: sequelize.models.WorkflowStep,
        as: 'step'
      }
    ]
  });
};

module.exports = WorkflowNotification;
