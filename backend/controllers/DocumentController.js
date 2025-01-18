/**
 * Document Controller
 * 
 * Handles all document-related operations including:
 * - Document upload and download
 * - Document metadata management
 * - Document versioning
 * - Document search and filtering
 * - Access control and permissions
 * 
 * @module controllers/documentController
 */

const BaseController = require('./BaseController');
const DocumentService = require('../services/DocumentService');
const { validateFileType, validateFileSize } = require('../utils/validators');
const fs = require('fs').promises;

/**
 * Document Controller class
 * 
 * @class DocumentController
 * @extends BaseController
 */
class DocumentController extends BaseController {
  /**
   * Constructor
   * 
   * Initializes the controller with a DocumentService instance
   */
  constructor() {
    super(new DocumentService());
  }

  /**
   * Upload a new document
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.file - Uploaded file object from multer
   * @param {Object} res - Express response object
   */
  uploadDocument = this.handleAsync(async (req, res) => {
    const { file } = req;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file
    if (!validateFileType(file.mimetype)) {
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    if (!validateFileSize(file.size)) {
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        message: 'File size exceeds limit'
      });
    }

    const document = await this.service.create({
      ...req.body,
      userId: req.user.id
    }, file);

    res.status(201).json({
      success: true,
      data: document
    });
  });

  /**
   * Get document details with versions
   * 
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Document ID
   * @param {Object} res - Express response object
   */
  getDocument = this.handleAsync(async (req, res) => {
    const { id } = req.params;
    const document = await this.service.getWithVersions(id, req.user.id);

    res.json({
      success: true,
      data: document
    });
  });

  /**
   * Upload a new version of a document
   * 
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Document ID
   * @param {Object} req.file - Uploaded file object from multer
   * @param {Object} res - Express response object
   */
  uploadVersion = this.handleAsync(async (req, res) => {
    const { id } = req.params;
    const { file } = req;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file
    if (!validateFileType(file.mimetype)) {
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    if (!validateFileSize(file.size)) {
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        message: 'File size exceeds limit'
      });
    }

    const version = await this.service.createVersion(id, file, req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: version
    });
  });

  /**
   * Download a document
   * 
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Document ID
   * @param {Object} res - Express response object
   */
  downloadDocument = this.handleAsync(async (req, res) => {
    const { id } = req.params;
    const fileInfo = await this.service.getFile(id, req.user.id);

    res.download(fileInfo.path, fileInfo.filename, async (err) => {
      if (fileInfo.isTemp) {
        // Clean up decrypted file after download
        await fs.unlink(fileInfo.path).catch(() => {});
      }
    });
  });

  /**
   * Search documents
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters for search and filtering
   * @param {Object} res - Express response object
   */
  searchDocuments = this.handleAsync(async (req, res) => {
    const { query, ...filters } = req.query;
    const results = await this.service.searchDocuments(
      query,
      filters,
      req.user.id
    );

    res.json({
      success: true,
      ...results
    });
  });

  /**
   * Get document thumbnail
   * 
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Document ID
   * @param {Object} res - Express response object
   */
  getThumbnail = this.handleAsync(async (req, res) => {
    const { id } = req.params;
    const document = await this.service.findById(id);

    if (!document || !document.thumbnailPath) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    res.sendFile(document.thumbnailPath);
  });

  /**
   * Delete a document version
   * 
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Document ID
   * @param {string} req.params.versionId - Version ID
   * @param {Object} res - Express response object
   */
  deleteVersion = this.handleAsync(async (req, res) => {
    const { id, versionId } = req.params;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    await this.service.deleteVersion(id, versionId);

    res.json({
      success: true,
      message: 'Version deleted successfully'
    });
  });

  /**
   * Archive a document
   * 
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Document ID
   * @param {Object} res - Express response object
   */
  archiveDocument = this.handleAsync(async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const document = await this.service.update(id, { status: 'ARCHIVED' });

    res.json({
      success: true,
      data: document
    });
  });

  /**
   * Restore an archived document
   * 
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Document ID
   * @param {Object} res - Express response object
   */
  restoreDocument = this.handleAsync(async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const document = await this.service.update(id, { status: 'ACTIVE' });

    res.json({
      success: true,
      data: document
    });
  });

  /**
   * Get document statistics
   * 
   * @param {Object} req - Express request object
   * @param {string} req.query.departmentId - Department ID
   * @param {Object} res - Express response object
   */
  getStatistics = this.handleAsync(async (req, res) => {
    const { departmentId } = req.query;
    const stats = await this.service.getStatistics(departmentId);

    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = DocumentController;
