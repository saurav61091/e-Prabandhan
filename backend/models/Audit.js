const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Audit = sequelize.define('Audit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'authentication',
      'file',
      'user',
      'security',
      'system',
      'configuration'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('success', 'failure', 'warning', 'info'),
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resourceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resourceType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  oldValues: {
    type: DataTypes.JSON,
    allowNull: true
  },
  newValues: {
    type: DataTypes.JSON,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'low'
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['action']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['resourceType', 'resourceId']
    }
  ],
  hooks: {
    beforeCreate: (audit) => {
      // Ensure sensitive data is not logged
      if (audit.metadata) {
        const sensitiveFields = ['password', 'token', 'secret', 'key'];
        for (const field of sensitiveFields) {
          if (audit.metadata[field]) {
            audit.metadata[field] = '[REDACTED]';
          }
        }
      }
    }
  }
});

module.exports = Audit;
