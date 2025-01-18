/**
 * Document Model
 * 
 * Represents a document in the system. This model handles document metadata,
 * versioning, and relationships with other entities like users and workflows.
 * 
 * @module models/Document
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { encryptFile, decryptFile } = require('../utils/encryption');
const path = require('path');
const fs = require('fs').promises;

/**
 * Document Model
 */
const Document = sequelize.define('Document', {
  /**
   * Unique identifier for the document
   * @property id
   * @type {number}
   * @required
   */
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  /**
   * Title of the document
   * @property title
   * @type {string}
   * @required
   */
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  /**
   * Description of the document
   * @property description
   * @type {string}
   */
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  /**
   * File path of the document
   * @property filePath
   * @type {string}
   * @required
   */
  filePath: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  /**
   * File type of the document
   * @property fileType
   * @type {string}
   */
  fileType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  /**
   * File size of the document in bytes
   * @property fileSize
   * @type {number}
   */
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  /**
   * User who created the document
   * @property createdBy
   * @type {number}
   * @required
   */
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  /**
   * Department that the document belongs to
   * @property departmentId
   * @type {number}
   * @required
   */
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  /**
   * Status of the document in the workflow
   * @property status
   * @type {string}
   * @enum ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']
   */
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'DRAFT'
  },
  /**
   * Version number of the document
   * @property version
   * @type {number}
   * @default 1
   */
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  /**
   * Whether the document is encrypted
   * @property isEncrypted
   * @type {boolean}
   * @default false
   */
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  /**
   * Metadata associated with the document
   * @property metadata
   * @type {object}
   */
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  /**
   * Tags associated with the document
   * @property tags
   * @type {array}
   */
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  /**
   * Date when the document expires
   * @property expiryDate
   * @type {date}
   */
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  /**
   * Date when the document was last accessed
   * @property lastAccessedAt
   * @type {date}
   */
  lastAccessedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  /**
   * Number of times the document has been accessed
   * @property accessCount
   * @type {number}
   * @default 0
   */
  accessCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  /**
   * Model hooks
   */
  hooks: {
    /**
     * Before creating a document, encrypt the file if encryption is enabled
     */
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
    /**
     * Before destroying a document, delete the associated file
     */
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

/**
 * Instance methods
 */
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

/**
 * Model associations
 */
Document.associate = function(models) {
  // Creator of the document
  Document.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  
  // Department that the document belongs to
  Document.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });
  
  // Document versions
  Document.hasMany(models.DocumentVersion, {
    foreignKey: 'documentId',
    as: 'versions'
  });
  
  // Document approvals
  Document.hasMany(models.DocumentApproval, {
    foreignKey: 'documentId',
    as: 'approvals'
  });
  
  // Document workflow
  Document.belongsTo(models.Workflow, {
    foreignKey: 'workflowId',
    as: 'workflow'
  });
};

module.exports = Document;
