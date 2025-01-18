const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RetentionPolicy = sequelize.define('RetentionPolicy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true // null means applies to all departments
  },
  fileTypes: {
    type: DataTypes.JSON,
    defaultValue: [], // Array of file extensions
    allowNull: false
  },
  retentionPeriod: {
    type: DataTypes.INTEGER, // in days
    allowNull: false
  },
  warningPeriod: {
    type: DataTypes.INTEGER, // days before expiry to send warning
    defaultValue: 30
  },
  action: {
    type: DataTypes.ENUM('archive', 'delete'),
    defaultValue: 'archive'
  },
  archivePath: {
    type: DataTypes.STRING,
    allowNull: true // Only required if action is 'archive'
  },
  requireApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  approvers: {
    type: DataTypes.JSON,
    defaultValue: [], // Array of user IDs who can approve
    allowNull: false
  },
  autoNotify: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notifyUsers: {
    type: DataTypes.JSON,
    defaultValue: [], // Array of user IDs to notify
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true // Enable soft deletes
});

module.exports = RetentionPolicy;
