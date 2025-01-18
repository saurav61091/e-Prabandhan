const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RetentionApproval = sequelize.define('RetentionApproval', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fileId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Files',
      key: 'id'
    }
  },
  policyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'RetentionPolicies',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  rejectedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  remindersSent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastReminderSent: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['fileId']
    },
    {
      fields: ['policyId']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = RetentionApproval;
