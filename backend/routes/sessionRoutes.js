const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  getUserSessions,
  revokeSession,
  revokeOtherSessions,
  refreshSession,
  verifyMFA,
  getCurrentSession
} = require('../controllers/sessionController');

// Rate limiting for session operations
const rateLimit = require('express-rate-limit');

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 refresh attempts per window
});

const mfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 MFA verification attempts per window
});

// Public routes (no authentication required)
router.post('/refresh', refreshLimiter, refreshSession);

// Protected routes (require authentication)
router.use(authenticate);

// Session management
router.get('/', getUserSessions);
router.get('/current', getCurrentSession);
router.post('/verify-mfa', mfaLimiter, verifyMFA);
router.delete('/:sessionId', revokeSession);
router.delete('/', revokeOtherSessions);

module.exports = router;
