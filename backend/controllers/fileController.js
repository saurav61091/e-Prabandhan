const File = require('../models/File');
const FileNote = require('../models/FileNote');
const FileVersion = require('../models/FileVersion');
const FileMovement = require('../models/FileMovement');
const FileAccessLog = require('../models/FileAccessLog');
const User = require('../models/User');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { encryptFile, decryptFile, createTempDecryptedCopy } = require('../utils/encryption');
const { validateFileAccess } = require('../middleware/fileAccessMiddleware');
const PreviewService = require('../services/previewService');
const EncryptionService = require('../services/encryptionService');
const createError = require('http-errors');

// Helper function to generate file number
const generateFileNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const count = await File.count({
    where: {
      createdAt: {
        [Op.gte]: new Date(year, 0, 1),
        [Op.lt]: new Date(year + 1, 0, 1)
      }
    }
  });
  return `FILE-${year}-${(count + 1).toString().padStart(5, '0')}`;
};

// Helper function to log file access
const logFileAccess = async (fileId, userId, action, req, success = true, failureReason = null) => {
  await FileAccessLog.create({
    fileId,
    userId,
    action,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    deviceInfo: {
      platform: req.get('sec-ch-ua-platform'),
      mobile: req.get('sec-ch-ua-mobile')
    },
    success,
    failureReason
  });
};

// Helper function to create file version
const createFileVersion = async (file, userId, changeType, changes = {}) => {
  const versionNumber = await FileVersion.count({ where: { fileId: file.id } }) + 1;
  const fileContent = await fs.readFile(file.path);
  const hash = crypto.createHash('sha256').update(fileContent).digest('hex');

  await FileVersion.create({
    fileId: file.id,
    versionNumber,
    path: file.path,
    changeType,
    changes,
    createdBy: userId,
    hash,
    size: fileContent.length,
    isEncrypted: file.isConfidential,
    encryptionKey: file.encryptionKey
  });

  await file.update({ version: versionNumber });
};

const createFile = async (req, res) => {
  try {
    const {
      name,
      metadata,
      isConfidential,
      department,
      tags = []
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let filePath = req.file.path;
    let encryptionKey = null;

    // Encrypt file if confidential
    if (isConfidential) {
      const { path: encryptedPath, key } = await EncryptionService.encryptFile(
        filePath,
        filePath + '.encrypted'
      );
      
      // Delete original file
      await fs.unlink(filePath);
      filePath = encryptedPath;
      encryptionKey = key;
    }

    // Encrypt sensitive metadata if present
    let encryptedMetadata = null;
    if (metadata && Object.keys(metadata).length > 0) {
      const { data, key } = await EncryptionService.encryptData(metadata);
      encryptedMetadata = {
        data,
        key
      };
    }

    const file = await File.create({
      name,
      path: filePath,
      type: req.file.mimetype,
      size: req.file.size,
      metadata: encryptedMetadata || metadata,
      department,
      tags,
      createdBy: req.user.id,
      isEncrypted: isConfidential,
      encryptionKey
    });

    // Log file creation
    await FileAccessLog.create({
      fileId: file.id,
      userId: req.user.id,
      action: 'create',
      metadata: {
        fileName: name,
        fileType: req.file.mimetype
      }
    });

    res.status(201).json(file);
  } catch (error) {
    console.error('File creation error:', error);
    res.status(500).json({ error: 'Error creating file' });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      department,
      priority,
      fromDate,
      toDate
    } = req.query;

    const where = {};
    
    // Access control
    if (!req.user.isAdmin) {
      where[Op.or] = [
        { createdBy: req.user.id },
        { currentLocation: req.user.id },
        { department: req.user.department }
      ];
    }

    if (status) where.status = status;
    if (department) where.department = department;
    if (priority) where.priority = priority;
    if (fromDate && toDate) {
      where.createdAt = {
        [Op.between]: [fromDate, toDate]
      };
    }

    if (search) {
      where[Op.or] = [
        { fileNumber: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: files } = await File.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'currentHolder',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * parseInt(limit)
    });

    // Log access
    await logFileAccess(null, req.user.id, 'view_list', req);

    res.json({
      files,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getFileById = async (req, res) => {
  try {
    const file = await File.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'currentHolder',
          attributes: ['id', 'name', 'email']
        },
        {
          model: FileNote,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: FileVersion,
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check access permission
    if (!req.user.isAdmin && 
        file.createdBy !== req.user.id && 
        file.currentLocation !== req.user.id && 
        file.department !== req.user.department) {
      await logFileAccess(file.id, req.user.id, 'view', req, false, 'Unauthorized access');
      return res.status(403).json({ error: 'Unauthorized to view this file' });
    }

    // Log access
    await logFileAccess(file.id, req.user.id, 'view', req);

    res.json(file);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      metadata,
      isConfidential,
      department,
      tags
    } = req.body;

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check access permission
    if (!req.user.isAdmin && 
        file.createdBy !== req.user.id && 
        file.currentLocation !== req.user.id) {
      await logFileAccess(file.id, req.user.id, 'update', req, false, 'Unauthorized access');
      return res.status(403).json({ error: 'Unauthorized to update this file' });
    }

    let updateData = {
      name,
      department,
      tags,
      lastModifiedBy: req.user.id
    };

    // Handle file update if new file uploaded
    if (req.file) {
      let filePath = req.file.path;
      let encryptionKey = null;

      // Encrypt new file if confidential
      if (isConfidential) {
        const { path: encryptedPath, key } = await EncryptionService.encryptFile(
          filePath,
          filePath + '.encrypted'
        );
        
        await fs.unlink(filePath);
        filePath = encryptedPath;
        encryptionKey = key;
      }

      updateData = {
        ...updateData,
        path: filePath,
        type: req.file.mimetype,
        size: req.file.size,
        isEncrypted: isConfidential,
        encryptionKey
      };

      // Delete old file
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }
    }

    // Handle metadata update
    if (metadata) {
      if (Object.keys(metadata).length > 0) {
        const { data, key } = await EncryptionService.encryptData(metadata);
        updateData.metadata = {
          data,
          key
        };
      } else {
        updateData.metadata = metadata;
      }
    }

    const updatedFile = await File.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // Log update
    await logFileAccess(file.id, req.user.id, 'update', req);

    res.json(updatedFile);
  } catch (error) {
    console.error('File update error:', error);
    res.status(500).json({ error: 'Error updating file' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ where: { id: req.params.id } });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check delete permission
    if (!req.user.isAdmin && file.createdBy !== req.user.id) {
      await logFileAccess(file.id, req.user.id, 'delete', req, false, 'Unauthorized access');
      return res.status(403).json({ error: 'Unauthorized to delete this file' });
    }

    // Get all versions
    const versions = await FileVersion.findAll({ where: { fileId: file.id } });

    // Delete all version files
    for (const version of versions) {
      try {
        await fs.unlink(version.path);
      } catch (error) {
        console.error(`Error deleting version file: ${version.path}`);
      }
    }

    // Delete current file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error(`Error deleting current file: ${file.path}`);
    }
    
    // Log access before deletion
    await logFileAccess(file.id, req.user.id, 'delete', req);

    // Delete from database
    await file.destroy();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check access permission
    if (!req.user.isAdmin && 
        file.createdBy !== req.user.id && 
        file.currentLocation !== req.user.id && 
        file.department !== req.user.department) {
      await logFileAccess(file.id, req.user.id, 'download', req, false, 'Unauthorized access');
      return res.status(403).json({ error: 'Unauthorized to download this file' });
    }

    let downloadPath = file.path;

    // Decrypt file if encrypted
    if (file.isEncrypted) {
      const tempPath = await EncryptionService.createTempDecryptedCopy(
        file.path,
        file.encryptionKey
      );
      downloadPath = tempPath;

      // Schedule cleanup
      res.on('finish', async () => {
        try {
          await fs.unlink(tempPath);
        } catch (error) {
          console.error('Error cleaning up temp file:', error);
        }
      });
    }

    // Log download
    await logFileAccess(file.id, req.user.id, 'download', req);

    res.download(downloadPath, file.name);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'Error downloading file' });
  }
};

const addFileNote = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { content, type, pageNumber, isPrivate } = req.body;

    const file = await File.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permission to add note
    if (!req.user.isAdmin && 
        file.createdBy !== req.user.id && 
        file.currentLocation !== req.user.id && 
        file.department !== req.user.department) {
      return res.status(403).json({ error: 'Unauthorized to add notes to this file' });
    }

    const note = await FileNote.create({
      fileId,
      userId: req.user.id,
      content,
      type: type || 'note',
      pageNumber,
      isPrivate: isPrivate === 'true'
    });

    // Log access
    await logFileAccess(fileId, req.user.id, 'add_note', req);

    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const moveFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { toUserId, action, remarks, dueDate, priority, instructions } = req.body;

    const file = await File.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permission to move file
    if (!req.user.isAdmin && file.currentLocation !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to move this file' });
    }

    const movement = await FileMovement.create({
      fileId,
      fromUserId: req.user.id,
      toUserId,
      action,
      remarks,
      dueDate,
      priority,
      instructions,
      acknowledgementRequired: true
    });

    // Update file location
    await file.update({
      currentLocation: toUserId,
      status: 'in_progress'
    });

    // Log access
    await logFileAccess(fileId, req.user.id, 'move', req);

    res.status(201).json(movement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getFileHistory = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findByPk(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permission to view history
    if (!req.user.isAdmin && 
        file.createdBy !== req.user.id && 
        file.currentLocation !== req.user.id && 
        file.department !== req.user.department) {
      return res.status(403).json({ error: 'Unauthorized to view this file\'s history' });
    }

    const [movements, versions, accessLogs] = await Promise.all([
      FileMovement.findAll({
        where: { fileId },
        include: [
          { model: User, as: 'fromUser', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'toUser', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      }),
      FileVersion.findAll({
        where: { fileId },
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ],
        order: [['versionNumber', 'DESC']]
      }),
      FileAccessLog.findAll({
        where: { fileId },
        include: [
          { model: User, attributes: ['id', 'name', 'email'] }
        ],
        order: [['accessTime', 'DESC']]
      })
    ]);

    // Log access
    await logFileAccess(fileId, req.user.id, 'view_history', req);

    res.json({
      movements,
      versions,
      accessLogs
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const batchDelete = async (req, res) => {
  try {
    const { fileIds } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: 'No file IDs provided' });
    }

    const files = await File.findAll({
      where: { id: fileIds }
    });

    // Check permissions
    for (const file of files) {
      if (!req.user.isAdmin && file.createdBy !== req.user.id) {
        return res.status(403).json({
          error: `Unauthorized to delete file: ${file.fileNumber}`
        });
      }
    }

    // Delete files
    for (const file of files) {
      // Get all versions
      const versions = await FileVersion.findAll({
        where: { fileId: file.id }
      });

      // Delete all version files
      for (const version of versions) {
        try {
          await fs.unlink(version.path);
        } catch (error) {
          console.error(`Error deleting version file: ${version.path}`);
        }
      }

      // Delete current file
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error(`Error deleting file: ${file.path}`);
      }
      
      // Log access before deletion
      await logFileAccess(file.id, req.user.id, 'batch_delete', req);
    }

    // Delete from database
    await File.destroy({
      where: { id: fileIds }
    });

    res.json({ message: 'Files deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const batchMove = async (req, res) => {
  try {
    const { fileIds, toUserId, action, remarks, dueDate, priority, instructions } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: 'No file IDs provided' });
    }

    const files = await File.findAll({
      where: { id: fileIds }
    });

    // Check permissions
    for (const file of files) {
      if (!req.user.isAdmin && file.currentLocation !== req.user.id) {
        return res.status(403).json({
          error: `Unauthorized to move file: ${file.fileNumber}`
        });
      }
    }

    const movements = [];
    for (const file of files) {
      const movement = await FileMovement.create({
        fileId: file.id,
        fromUserId: req.user.id,
        toUserId,
        action,
        remarks,
        dueDate,
        priority,
        instructions,
        acknowledgementRequired: true
      });

      // Update file location
      await file.update({
        currentLocation: toUserId,
        status: 'in_progress'
      });

      // Log access
      await logFileAccess(file.id, req.user.id, 'batch_move', req);

      movements.push(movement);
    }

    res.status(201).json(movements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const batchUpdateTags = async (req, res) => {
  try {
    const { fileIds, tags, action } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: 'No file IDs provided' });
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'No tags provided' });
    }

    const files = await File.findAll({
      where: { id: fileIds }
    });

    // Check permissions
    for (const file of files) {
      if (!req.user.isAdmin && 
          file.createdBy !== req.user.id && 
          file.currentLocation !== req.user.id) {
        return res.status(403).json({
          error: `Unauthorized to update tags for file: ${file.fileNumber}`
        });
      }
    }

    // Update tags
    for (const file of files) {
      let updatedTags;
      if (action === 'add') {
        updatedTags = [...new Set([...file.tags, ...tags])];
      } else if (action === 'remove') {
        updatedTags = file.tags.filter(tag => !tags.includes(tag));
      } else if (action === 'set') {
        updatedTags = tags;
      }

      await file.update({ tags: updatedTags });
      await logFileAccess(file.id, req.user.id, 'batch_update_tags', req);
    }

    res.json({ message: 'Tags updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const batchSetConfidential = async (req, res) => {
  try {
    const { fileIds, isConfidential } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: 'No files specified' });
    }

    const files = await File.find({ _id: { $in: fileIds } });

    // Process each file
    for (const file of files) {
      // Check access permission
      if (!req.user.isAdmin && 
          file.createdBy !== req.user.id && 
          file.currentLocation !== req.user.id) {
        continue;
      }

      if (isConfidential && !file.isEncrypted) {
        // Encrypt file
        const { path: encryptedPath, key } = await EncryptionService.encryptFile(
          file.path,
          file.path + '.encrypted'
        );

        // Update file record
        await File.findByIdAndUpdate(file.id, {
          path: encryptedPath,
          isEncrypted: true,
          encryptionKey: key
        });

        // Delete original file
        await fs.unlink(file.path);
      } else if (!isConfidential && file.isEncrypted) {
        // Decrypt file
        const { path: decryptedPath } = await EncryptionService.decryptFile(
          file.path,
          file.encryptionKey,
          file.path.replace('.encrypted', '')
        );

        // Update file record
        await File.findByIdAndUpdate(file.id, {
          path: decryptedPath,
          isEncrypted: false,
          encryptionKey: null
        });

        // Delete encrypted file
        await fs.unlink(file.path);
      }

      // Log action
      await logFileAccess(file.id, req.user.id, 'batch_update_confidentiality', req);
    }

    res.json({ message: 'Confidentiality updated successfully' });
  } catch (error) {
    console.error('Batch set confidential error:', error);
    res.status(500).json({ error: 'Error updating files' });
  }
};

const searchFiles = async (req, res) => {
  try {
    const {
      query,
      department,
      category,
      status,
      priority,
      confidentialityLevel,
      dateRange,
      tags,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build search criteria
    const searchCriteria = {};
    
    // Full-text search if query is provided
    if (query) {
      searchCriteria.$text = { $search: query };
    }

    // Department filter
    if (department) {
      searchCriteria.department = department;
    }

    // Category filter
    if (category) {
      searchCriteria['metadata.category'] = category;
    }

    // Status filter
    if (status) {
      searchCriteria['metadata.status'] = status;
    }

    // Priority filter
    if (priority) {
      searchCriteria['metadata.priority'] = priority;
    }

    // Confidentiality level filter
    if (confidentialityLevel) {
      searchCriteria['metadata.confidentialityLevel'] = confidentialityLevel;
    }

    // Date range filter
    if (dateRange) {
      const { start, end } = dateRange;
      if (start && end) {
        searchCriteria.createdAt = {
          $gte: new Date(start),
          $lte: new Date(end)
        };
      }
    }

    // Tags filter
    if (tags && tags.length > 0) {
      searchCriteria.tags = { $all: tags };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute search with pagination and sorting
    const files = await File.find(searchCriteria)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('department', 'name')
      .populate('lastModifiedBy', 'name email');

    // Get total count for pagination
    const total = await File.countDocuments(searchCriteria);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      files,
      pagination: {
        total,
        page: parseInt(page),
        totalPages,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search files error:', error);
    res.status(500).json({ error: 'Error searching files' });
  }
};

const getFileSuggestions = async (req, res) => {
  try {
    const { userId } = req.user;
    const { context } = req.query;

    // Get user's recent files
    const recentFiles = await FileAccessLog.find({ userId })
      .sort({ accessedAt: -1 })
      .limit(5)
      .populate('fileId');

    // Get files similar to the context
    const similarFiles = context ? 
      await File.find(
        { $text: { $search: context } },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(5) : [];

    // Get frequently accessed files
    const frequentFiles = await FileAccessLog.aggregate([
      { $group: { _id: '$fileId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      recentFiles: recentFiles.map(log => log.fileId),
      similarFiles,
      frequentFiles: await File.find({ _id: { $in: frequentFiles.map(f => f._id) } })
    });
  } catch (error) {
    console.error('Get file suggestions error:', error);
    res.status(500).json({ error: 'Error getting file suggestions' });
  }
};

const generatePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'thumbnail' } = req.query;

    // Get file details
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check access permission
    if (!await validateFileAccess(req.user, file)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate preview
    const preview = await PreviewService.generatePreview(file, type);

    // For text previews, send content directly
    if (typeof preview === 'object' && preview.type === 'text') {
      return res.json(preview);
    }

    // For file previews, stream the file
    res.sendFile(preview);

  } catch (error) {
    console.error('Preview generation error:', error);
    res.status(500).json({ error: 'Error generating preview' });
  }
};

module.exports = {
  createFile,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile,
  downloadFile,
  addFileNote,
  moveFile,
  getFileHistory,
  batchDelete,
  batchMove,
  batchUpdateTags,
  batchSetConfidential,
  searchFiles,
  getFileSuggestions,
  generatePreview
};
