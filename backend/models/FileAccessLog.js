const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const File = require('./File');

const FileAccessLog = sequelize.define('FileAccessLog', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('view', 'download', 'print', 'edit', 'share', 'delete'),
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.STRING
  },
  deviceInfo: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  accessTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  failureReason: {
    type: DataTypes.STRING
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Additional context about the access'
  }
});

// Associations
FileAccessLog.belongsTo(File, { foreignKey: 'fileId' });
FileAccessLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = FileAccessLog;
