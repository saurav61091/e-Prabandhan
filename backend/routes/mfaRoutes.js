const express = require('express');
const router = express.Router();
const mfaController = require('../controllers/mfaController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for MFA verification attempts
const mfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many MFA attempts, please try again later'
});

// Setup and management routes (require authentication)
router.post('/setup', authenticate, mfaController.setupMFA);
router.post('/verify-setup', authenticate, mfaController.verifyMFASetup);
router.post('/disable', authenticate, mfaController.disableMFA);
router.post('/backup-codes', authenticate, mfaController.regenerateBackupCodes);
router.get('/status', authenticate, mfaController.getMFAStatus);

// Login verification route (no authentication required)
router.post('/verify', mfaLimiter, mfaController.verifyMFALogin);

module.exports = router;
