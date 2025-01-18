const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Report = sequelize.define('Report', {
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
  type: {
    type: DataTypes.ENUM('leave', 'tour', 'expense', 'attendance', 'custom'),
    allowNull: false
  },
  template: {
    type: DataTypes.JSON,
    allowNull: false
  },
  schedule: {
    type: DataTypes.JSON,
    // For scheduled reports: { frequency: 'daily|weekly|monthly', time: '09:00', dayOfWeek: 1, dayOfMonth: 1 }
  },
  filters: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  recipients: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  lastGeneratedAt: {
    type: DataTypes.DATE
  }
});

// Associations
Report.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

module.exports = Report;
