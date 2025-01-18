const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FileTemplate = sequelize.define('FileTemplate', {
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
  category: {
    type: DataTypes.STRING
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  defaultTags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  requiredFields: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  defaultSubject: {
    type: DataTypes.STRING
  },
  defaultPriority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  retentionPeriod: {
    type: DataTypes.INTEGER, // in days
    defaultValue: 365
  },
  workflowSteps: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  department: {
    type: DataTypes.STRING
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true // Enable soft deletes
});

// Associations will be set up in associations.js
module.exports = FileTemplate;
