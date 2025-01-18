const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FileShare = sequelize.define('FileShare', {
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
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  shareToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  accessType: {
    type: DataTypes.ENUM('view', 'download', 'edit'),
    allowNull: false,
    defaultValue: 'view'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  maxDownloads: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  remainingDownloads: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notifyOnAccess: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  departmentOnly: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'revoked'),
    allowNull: false,
    defaultValue: 'active'
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  accessCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  indexes: [
    {
      fields: ['shareToken']
    },
    {
      fields: ['fileId']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['status']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

// Define associations
FileShare.associate = (models) => {
  FileShare.belongsTo(models.File, {
    foreignKey: 'fileId',
    as: 'file'
  });
  
  FileShare.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  
  FileShare.belongsToMany(models.User, {
    through: 'FileShareRecipients',
    as: 'recipients'
  });
};

// Instance methods
FileShare.prototype.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

FileShare.prototype.canAccess = function() {
  if (this.status !== 'active') return false;
  if (this.isExpired()) return false;
  if (this.maxDownloads && this.remainingDownloads <= 0) return false;
  return true;
};

FileShare.prototype.incrementAccessCount = async function() {
  this.accessCount += 1;
  this.lastAccessedAt = new Date();
  await this.save();
};

module.exports = FileShare;
