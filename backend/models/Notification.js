const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
      'file_shared',
      'file_accessed',
      'comment_added',
      'task_assigned',
      'task_updated',
      'deadline_approaching',
      'security_alert',
      'system_notification',
      'mention',
      'approval_request',
      'approval_status'
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
    allowNull: false,
    defaultValue: 'low'
  },
  status: {
    type: DataTypes.ENUM('unread', 'read', 'archived'),
    allowNull: false,
    defaultValue: 'unread'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  archivedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  channel: {
    type: DataTypes.ENUM('in_app', 'email', 'push', 'sms'),
    allowNull: false,
    defaultValue: 'in_app'
  },
  deliveryStatus: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Departments',
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['departmentId']
    },
    {
      fields: ['createdAt']
    }
  ],
  hooks: {
    beforeCreate: async (notification) => {
      // Set expiration for notifications if not specified
      if (!notification.expiresAt) {
        const expirationDays = {
          low: 30,
          medium: 60,
          high: 90,
          urgent: 120
        };
        notification.expiresAt = new Date();
        notification.expiresAt.setDate(
          notification.expiresAt.getDate() + expirationDays[notification.priority]
        );
      }
    }
  }
});

// Define associations
Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  Notification.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });
};

// Instance methods
Notification.prototype.markAsRead = async function() {
  this.status = 'read';
  this.readAt = new Date();
  await this.save();
};

Notification.prototype.archive = async function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  await this.save();
};

Notification.prototype.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Static methods
Notification.markAllAsRead = async function(userId) {
  try {
    const result = await this.update(
      {
        status: 'read',
        readAt: new Date()
      },
      {
        where: {
          userId,
          status: 'unread'
        }
      }
    );
    return result[0];
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};

Notification.archiveOldNotifications = async function(days = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.update(
      {
        status: 'archived',
        archivedAt: new Date()
      },
      {
        where: {
          status: {
            [Op.ne]: 'archived'
          },
          createdAt: {
            [Op.lt]: cutoffDate
          }
        }
      }
    );
    return result[0];
  } catch (error) {
    console.error('Archive old notifications error:', error);
    throw error;
  }
};

module.exports = Notification;
