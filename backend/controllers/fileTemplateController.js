const FileTemplate = require('../models/FileTemplate');
const File = require('../models/File');
const User = require('../models/User');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const { encryptFile } = require('../utils/encryption');

const createTemplate = async (req, res) => {
  try {
    const template = await FileTemplate.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllTemplates = async (req, res) => {
  try {
    const where = {};
    
    if (!req.user.isAdmin) {
      where[Op.or] = [
        { createdBy: req.user.id },
        { department: req.user.department }
      ];
    }

    if (req.query.category) {
      where.category = req.query.category;
    }

    if (req.query.department) {
      where.department = req.query.department;
    }

    const templates = await FileTemplate.findAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(templates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await FileTemplate.findOne({
      where: { id: req.params.id },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const template = await FileTemplate.findOne({
      where: { id: req.params.id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!req.user.isAdmin && template.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this template' });
    }

    await template.update(req.body);
    res.json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const template = await FileTemplate.findOne({
      where: { id: req.params.id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!req.user.isAdmin && template.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this template' });
    }

    await template.destroy();
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createFileFromTemplate = async (req, res) => {
  try {
    const template = await FileTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate file number
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
    const fileNumber = `FILE-${year}-${(count + 1).toString().padStart(5, '0')}`;

    // Create file with template defaults
    const file = await File.create({
      fileNumber,
      name: req.file.originalname,
      type: path.extname(req.file.originalname),
      path: req.file.path,
      subject: req.body.subject || template.defaultSubject,
      description: req.body.description,
      metadata: {
        size: req.file.size,
        mimetype: req.file.mimetype,
        ...template.metadata,
        ...req.body.metadata
      },
      createdBy: req.user.id,
      currentLocation: req.user.id,
      department: req.user.department,
      priority: req.body.priority || template.defaultPriority,
      tags: [...template.defaultTags, ...(req.body.tags ? JSON.parse(req.body.tags) : [])],
      retentionDate: new Date(Date.now() + template.retentionPeriod * 24 * 60 * 60 * 1000),
      templateId: template.id
    });

    // If file should be confidential
    if (req.body.isConfidential === 'true') {
      const password = crypto.randomBytes(32).toString('hex');
      const { encryptedPath, salt, iv, tag } = await encryptFile(file.path, password);
      
      await file.update({
        path: encryptedPath,
        encryptionKey: password,
        encryptionMetadata: { salt, iv, tag },
        isConfidential: true
      });
    }

    res.status(201).json(file);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const batchCreateFromTemplate = async (req, res) => {
  try {
    const template = await FileTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = [];
    const year = new Date().getFullYear();
    let count = await File.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(year + 1, 0, 1)
        }
      }
    });

    for (const file of req.files) {
      count++;
      const fileNumber = `FILE-${year}-${count.toString().padStart(5, '0')}`;

      const newFile = await File.create({
        fileNumber,
        name: file.originalname,
        type: path.extname(file.originalname),
        path: file.path,
        subject: template.defaultSubject,
        metadata: {
          size: file.size,
          mimetype: file.mimetype,
          ...template.metadata
        },
        createdBy: req.user.id,
        currentLocation: req.user.id,
        department: req.user.department,
        priority: template.defaultPriority,
        tags: template.defaultTags,
        retentionDate: new Date(Date.now() + template.retentionPeriod * 24 * 60 * 60 * 1000),
        templateId: template.id
      });

      files.push(newFile);
    }

    res.status(201).json(files);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  createFileFromTemplate,
  batchCreateFromTemplate
};
