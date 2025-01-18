const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { encryptFile, decryptFile } = require('../utils/encryption');
const path = require('path');
const fs = require('fs').promises;

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  filePath: {
    type: DataTypes.STRING(255),
    allowNull: false
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
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'DRAFT'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  accessCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  hooks: {
    beforeCreate: async (document) => {
      if (process.env.ENABLE_FILE_ENCRYPTION === 'true' && !document.isEncrypted) {
        const filePath = path.join(process.env.UPLOAD_DIR, document.filePath);
        const encryptedPath = `${filePath}.enc`;
        
        await encryptFile(filePath, encryptedPath);
        await fs.unlink(filePath);
        
        document.filePath = path.basename(encryptedPath);
        document.isEncrypted = true;
      }
    },
    beforeDestroy: async (document) => {
      // Delete file when document is deleted
      const filePath = path.join(process.env.UPLOAD_DIR, document.filePath);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  }
});

// Instance methods
Document.prototype.getFile = async function() {
  const filePath = path.join(process.env.UPLOAD_DIR, this.filePath);
  
  if (this.isEncrypted) {
    const decryptedPath = path.join(process.env.TEMP_DIR, `dec_${this.id}_${Date.now()}`);
    await decryptFile(filePath, decryptedPath);
    
    // Schedule cleanup of decrypted file
    setTimeout(async () => {
      try {
        await fs.unlink(decryptedPath);
      } catch (error) {
        console.error('Error cleaning up decrypted file:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return decryptedPath;
  }
  
  return filePath;
};

Document.prototype.incrementAccessCount = async function() {
  this.accessCount += 1;
  this.lastAccessedAt = new Date();
  await this.save();
};

Document.prototype.getCurrentApprovalStep = async function() {
  const workflow = await this.getWorkflow();
  if (!workflow) return null;
  
  const pendingApproval = await this.getApprovals({
    where: { status: 'PENDING' },
    order: [['workflowStepId', 'ASC']],
    limit: 1,
    include: ['workflowStep']
  });
  
  return pendingApproval[0]?.workflowStep || null;
};

Document.prototype.isApprovalRequired = async function() {
  const workflow = await this.getWorkflow();
  return !!workflow;
};

Document.prototype.canBeApprovedBy = async function(userId) {
  const currentStep = await this.getCurrentApprovalStep();
  if (!currentStep) return false;
  
  const user = await sequelize.models.User.findByPk(userId, {
    include: ['designation']
  });
  
  return currentStep.designationId === user.designationId;
};

// Model associations
Document.associate = function(models) {
  Document.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  
  Document.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });
  
  Document.hasMany(models.DocumentVersion, {
    foreignKey: 'documentId',
    as: 'versions'
  });
  
  Document.hasMany(models.DocumentApproval, {
    foreignKey: 'documentId',
    as: 'approvals'
  });
  
  Document.belongsTo(models.Workflow, {
    foreignKey: 'workflowId',
    as: 'workflow'
  });
};

module.exports = Document;
