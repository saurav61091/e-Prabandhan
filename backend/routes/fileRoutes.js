const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { isAuthenticated } = require('../middleware/auth');
const {
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
} = require('../controllers/fileController');

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

// Search and suggestions
router.get('/search', searchFiles);
router.get('/suggestions', getFileSuggestions);

// Single file operations
router.post('/', upload.single('file'), createFile);
router.get('/', getAllFiles);
router.get('/:id', getFileById);
router.put('/:id', upload.single('file'), updateFile);
router.delete('/:id', deleteFile);
router.get('/:id/download', downloadFile);
router.get('/:id/preview', generatePreview);
router.post('/:id/notes', addFileNote);
router.post('/:id/move', moveFile);
router.get('/:id/history', getFileHistory);

// Batch operations
router.post('/batch/delete', batchDelete);
router.post('/batch/move', batchMove);
router.post('/batch/tags', batchUpdateTags);
router.post('/batch/confidential', batchSetConfidential);

module.exports = router;
