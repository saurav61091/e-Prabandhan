const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'password'),
    defaultValue: 'string'
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  validation: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'settings',
  timestamps: true
});

module.exports = Setting;
