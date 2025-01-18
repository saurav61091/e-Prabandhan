const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const File = require('./File');

const FileVersion = sequelize.define('FileVersion', {
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
  versionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Path to the versioned file'
  },
  changeType: {
    type: DataTypes.ENUM('creation', 'modification', 'metadata_update', 'status_change'),
    allowNull: false
  },
  changes: {
    type: DataTypes.JSON,
    comment: 'Summary of changes made in this version'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Version-specific metadata'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  hash: {
    type: DataTypes.STRING,
    comment: 'File hash for integrity verification'
  },
  size: {
    type: DataTypes.INTEGER,
    comment: 'File size in bytes'
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  encryptionKey: {
    type: DataTypes.STRING,
    comment: 'Encryption key for this version'
  }
});

// Associations
FileVersion.belongsTo(File, { foreignKey: 'fileId' });
FileVersion.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

module.exports = FileVersion;
