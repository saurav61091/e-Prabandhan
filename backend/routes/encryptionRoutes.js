const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {
  encryptFile,
  decryptFile,
  reEncryptFile,
  getEncryptionStatus
} = require('../controllers/encryptionController');

// Rate limiting for encryption endpoints
const encryptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 50 requests per windowMs
});

// Apply rate limiting to all encryption routes
router.use(encryptionLimiter);

// Encryption routes
router.post('/files/:fileId/encrypt', auth, encryptFile);
router.post('/files/:fileId/decrypt', auth, decryptFile);
router.post('/files/:fileId/reencrypt', auth, reEncryptFile);
router.get('/files/:fileId/status', auth, getEncryptionStatus);

module.exports = router;
