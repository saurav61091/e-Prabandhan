const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {
  getFilePreview,
  getPreviewMetadata
} = require('../controllers/previewController');

// Rate limiting for preview endpoints
const previewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all preview routes
router.use(previewLimiter);

// Preview routes
router.get('/files/:fileId', auth, getFilePreview);
router.get('/files/:fileId/metadata', auth, getPreviewMetadata);

module.exports = router;
