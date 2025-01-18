const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs').promises;
const { encryptFile, decryptFile } = require('../utils/encryption');

const DocumentVersion = sequelize.define('DocumentVersion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  documentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  changesDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fileType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  hooks: {
    beforeCreate: async (version) => {
      if (process.env.ENABLE_FILE_ENCRYPTION === 'true' && !version.isEncrypted) {
        const filePath = path.join(process.env.UPLOAD_DIR, version.filePath);
        const encryptedPath = `${filePath}.enc`;
        
        await encryptFile(filePath, encryptedPath);
        await fs.unlink(filePath);
        
        version.filePath = path.basename(encryptedPath);
        version.isEncrypted = true;
      }
    },
    beforeDestroy: async (version) => {
      // Delete file when version is deleted
      const filePath = path.join(process.env.UPLOAD_DIR, version.filePath);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting version file:', error);
      }
    }
  }
});

// Instance methods
DocumentVersion.prototype.getFile = async function() {
  const filePath = path.join(process.env.UPLOAD_DIR, this.filePath);
  
  if (this.isEncrypted) {
    const decryptedPath = path.join(process.env.TEMP_DIR, `dec_v${this.id}_${Date.now()}`);
    await decryptFile(filePath, decryptedPath);
    
    // Schedule cleanup of decrypted file
    setTimeout(async () => {
      try {
        await fs.unlink(decryptedPath);
      } catch (error) {
        console.error('Error cleaning up decrypted version file:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return decryptedPath;
  }
  
  return filePath;
};

DocumentVersion.prototype.getDiff = async function(compareToVersion) {
  // This is a placeholder for implementing file diff functionality
  // You would need to implement the actual diff logic based on file type
  throw new Error('Diff functionality not implemented');
};

// Model associations
DocumentVersion.associate = function(models) {
  DocumentVersion.belongsTo(models.Document, {
    foreignKey: 'documentId',
    as: 'document'
  });
  
  DocumentVersion.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
};

module.exports = DocumentVersion;
