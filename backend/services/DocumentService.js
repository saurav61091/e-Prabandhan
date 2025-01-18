const BaseService = require('./BaseService');
const { Document, DocumentVersion, User, Workflow, WorkflowStep, DocumentApproval } = require('../models');
const { encryptFile, decryptFile } = require('../utils/encryption');
const { createThumbnail } = require('../utils/fileUtils');
const { sequelize } = require('../models');
const path = require('path');
const fs = require('fs').promises;

class DocumentService extends BaseService {
  constructor() {
    super(Document);
  }

  // Create new document with initial version
  async create(data, file) {
    const transaction = await sequelize.transaction();

    try {
      const { title, description, departmentId, isEncrypted = false, workflowId } = data;
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join('uploads', 'documents', fileName);

      // Handle file encryption if needed
      if (isEncrypted) {
        await encryptFile(file.path, filePath);
      } else {
        await fs.copyFile(file.path, filePath);
      }

      // Create thumbnail if it's an image or PDF
      let thumbnailPath = null;
      if (['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype)) {
        thumbnailPath = await createThumbnail(file.path, fileName);
      }

      // Create document record
      const document = await super.create({
        title,
        description,
        departmentId,
        filePath,
        thumbnailPath,
        fileType: file.mimetype,
        fileSize: file.size,
        isEncrypted,
        createdBy: data.userId,
        status: workflowId ? 'PENDING' : 'APPROVED'
      }, transaction);

      // Create initial version
      await DocumentVersion.create({
        documentId: document.id,
        version: 1,
        filePath,
        fileType: file.mimetype,
        fileSize: file.size,
        isEncrypted,
        createdBy: data.userId
      }, { transaction });

      // Initialize workflow if specified
      if (workflowId) {
        await this.initializeWorkflow(document.id, workflowId, data.userId, transaction);
      }

      await transaction.commit();
      return document;
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      // Cleanup temporary file
      await fs.unlink(file.path).catch(() => {});
    }
  }

  // Initialize workflow for document
  async initializeWorkflow(documentId, workflowId, userId, transaction) {
    const workflow = await Workflow.findByPk(workflowId, {
      include: [{
        model: WorkflowStep,
        order: [['stepNumber', 'ASC']]
      }]
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Create approval records for first step
    const firstSteps = workflow.WorkflowSteps.filter(step => step.stepNumber === 1);
    
    for (const step of firstSteps) {
      await DocumentApproval.create({
        documentId,
        workflowStepId: step.id,
        approverId: step.designationId, // This will be resolved to actual users later
        status: 'PENDING',
        deadline: step.deadline ? new Date(Date.now() + step.deadline * 60000) : null
      }, { transaction });
    }
  }

  // Get document with version history
  async getWithVersions(documentId, userId) {
    const document = await this.findOne(
      { id: documentId },
      {
        include: [
          {
            model: DocumentVersion,
            order: [['version', 'DESC']],
            include: [{
              model: User,
              as: 'creator',
              attributes: ['id', 'username', 'email']
            }]
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email']
          }
        ]
      }
    );

    if (!document) {
      throw new Error('Document not found');
    }

    // Update access count and last accessed
    await document.update({
      accessCount: document.accessCount + 1,
      lastAccessedAt: new Date()
    });

    return document;
  }

  // Create new document version
  async createVersion(documentId, file, data, userId) {
    const transaction = await sequelize.transaction();

    try {
      const document = await this.findById(documentId, { transaction });
      if (!document) {
        throw new Error('Document not found');
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join('uploads', 'documents', fileName);

      // Handle file encryption if needed
      if (document.isEncrypted) {
        await encryptFile(file.path, filePath);
      } else {
        await fs.copyFile(file.path, filePath);
      }

      // Get latest version number
      const latestVersion = await DocumentVersion.findOne({
        where: { documentId },
        order: [['version', 'DESC']],
        transaction
      });

      const newVersion = await DocumentVersion.create({
        documentId,
        version: latestVersion ? latestVersion.version + 1 : 1,
        filePath,
        fileType: file.mimetype,
        fileSize: file.size,
        isEncrypted: document.isEncrypted,
        createdBy: userId,
        changesDescription: data.changesDescription
      }, { transaction });

      // Update document's current file path
      await document.update({
        filePath,
        fileType: file.mimetype,
        fileSize: file.size,
        version: newVersion.version
      }, { transaction });

      await transaction.commit();
      return newVersion;
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      // Cleanup temporary file
      await fs.unlink(file.path).catch(() => {});
    }
  }

  // Get document file
  async getFile(documentId, userId) {
    const document = await this.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    let filePath = document.filePath;
    
    // Handle encrypted files
    if (document.isEncrypted) {
      const decryptedPath = path.join('uploads', 'temp', `dec-${path.basename(filePath)}`);
      await decryptFile(filePath, decryptedPath);
      filePath = decryptedPath;
    }

    return {
      path: filePath,
      filename: path.basename(filePath),
      mimetype: document.fileType,
      isTemp: document.isEncrypted
    };
  }

  // Search documents with filters
  async searchDocuments(query, filters = {}, userId) {
    const { departmentId, status, dateRange, fileType } = filters;
    
    const conditions = {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ]
    };

    if (departmentId) conditions.departmentId = departmentId;
    if (status) conditions.status = status;
    if (fileType) conditions.fileType = fileType;
    if (dateRange) {
      conditions.createdAt = {
        [Op.between]: [dateRange.start, dateRange.end]
      };
    }

    return this.findAndPaginate(
      filters.page || 1,
      filters.limit || 10,
      conditions,
      {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email']
          }
        ],
        order: [[filters.sortBy || 'createdAt', filters.sortOrder || 'DESC']]
      }
    );
  }
}

module.exports = DocumentService;
