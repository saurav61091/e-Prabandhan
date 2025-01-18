const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  createFileFromTemplate,
  batchCreateFromTemplate
} = require('../controllers/fileTemplateController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// All routes require authentication
router.use(isAuthenticated);

// Template Management Routes
router.post('/', createTemplate);
router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

// File Creation from Template Routes
router.post('/:id/create', upload.single('file'), createFileFromTemplate);
router.post('/:id/batch', upload.array('files', 10), batchCreateFromTemplate);

module.exports = router;
