const PreviewService = require('../services/previewService');
const File = require('../models/File');
const createError = require('http-errors');
const { validateSchema } = require('../utils/validation');
const { previewSchema } = require('../validation/previewSchema');
const path = require('path');
const fs = require('fs').promises;
const mime = require('mime-types');

/**
 * Generate and serve file preview
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getFilePreview = async (req, res) => {
  let previewPath = null;
  try {
    const { fileId } = req.params;
    const { type = 'thumbnail' } = req.query;

    // Validate parameters
    await validateSchema(previewSchema.preview, {
      fileId,
      type
    });

    // Get file details
    const file = await File.findOne({
      where: {
        id: fileId,
        [Op.or]: [
          { createdBy: req.user.id },
          { departmentId: req.user.departmentId },
          { isPublic: true },
          { sharedWith: { [Op.contains]: [req.user.id] } }
        ]
      }
    });

    if (!file) {
      throw createError(404, 'File not found');
    }

    // Generate preview
    previewPath = await PreviewService.generatePreview(file, type);

    // Handle text preview
    if (typeof previewPath === 'object' && previewPath.type === 'text') {
      return res.json({
        type: 'text',
        content: previewPath.content
      });
    }

    // Stream the preview file
    const stat = await fs.stat(previewPath);
    const contentType = mime.lookup(previewPath) || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });

    const readStream = fs.createReadStream(previewPath);
    readStream.pipe(res);

    // Clean up preview file after streaming (for temporary previews)
    readStream.on('end', async () => {
      if (type === 'thumbnail' || path.extname(file.path) !== path.extname(previewPath)) {
        try {
          await PreviewService.cleanupPreviews([previewPath]);
        } catch (error) {
          console.error('Preview cleanup error:', error);
        }
      }
    });
  } catch (error) {
    // Clean up preview file if error occurs
    if (previewPath) {
      try {
        await PreviewService.cleanupPreviews([previewPath]);
      } catch (cleanupError) {
        console.error('Preview cleanup error:', cleanupError);
      }
    }

    console.error('Get file preview error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error generating file preview'
    });
  }
};

/**
 * Get preview metadata
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getPreviewMetadata = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Validate parameters
    await validateSchema(previewSchema.metadata, {
      fileId
    });

    // Get file details
    const file = await File.findOne({
      where: {
        id: fileId,
        [Op.or]: [
          { createdBy: req.user.id },
          { departmentId: req.user.departmentId },
          { isPublic: true },
          { sharedWith: { [Op.contains]: [req.user.id] } }
        ]
      }
    });

    if (!file) {
      throw createError(404, 'File not found');
    }

    // Get preview metadata
    const metadata = {
      fileType: path.extname(file.path).toLowerCase(),
      mimeType: mime.lookup(file.path) || 'application/octet-stream',
      previewTypes: ['thumbnail'],
      size: file.size,
      lastModified: file.updatedAt
    };

    // Add supported preview types based on file type
    switch (metadata.fileType) {
      case '.pdf':
      case '.doc':
      case '.docx':
      case '.xls':
      case '.xlsx':
      case '.ppt':
      case '.pptx':
        metadata.previewTypes.push('full');
        break;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
        metadata.previewTypes.push('full', 'medium');
        break;
      case '.txt':
      case '.csv':
      case '.json':
      case '.xml':
        metadata.previewTypes.push('text');
        break;
    }

    res.json(metadata);
  } catch (error) {
    console.error('Get preview metadata error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error getting preview metadata'
    });
  }
};

module.exports = {
  getFilePreview,
  getPreviewMetadata
};
