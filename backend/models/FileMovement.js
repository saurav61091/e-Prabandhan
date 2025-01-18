const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const File = require('./File');

const FileMovement = sequelize.define('FileMovement', {
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
  fromUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  toUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('forward', 'return', 'assign', 'transfer'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending'
  },
  remarks: {
    type: DataTypes.TEXT
  },
  dueDate: {
    type: DataTypes.DATE
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  instructions: {
    type: DataTypes.TEXT
  },
  acknowledgementRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  acknowledgedAt: {
    type: DataTypes.DATE
  },
  completedAt: {
    type: DataTypes.DATE
  }
});

// Associations
FileMovement.belongsTo(File, { foreignKey: 'fileId' });
FileMovement.belongsTo(User, { as: 'fromUser', foreignKey: 'fromUserId' });
FileMovement.belongsTo(User, { as: 'toUser', foreignKey: 'toUserId' });

module.exports = FileMovement;
