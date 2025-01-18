const BaseController = require('./BaseController');
const DocumentService = require('../services/DocumentService');
const { validateFileType, validateFileSize } = require('../utils/validators');
const fs = require('fs').promises;

class DocumentController extends BaseController {
  constructor() {
    super(new DocumentService());
  }

  // Upload new document
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

  // Get document details with versions
  getDocument = this.handleAsync(async (req, res) => {
    const { id } = req.params;
    const document = await this.service.getWithVersions(id, req.user.id);

    res.json({
      success: true,
      data: document
    });
  });

  // Upload new version
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

  // Download document
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

  // Search documents
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

  // Get document thumbnail
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

  // Delete document version
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

  // Archive document
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

  // Restore archived document
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

  // Get document statistics
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
