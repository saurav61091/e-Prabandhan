const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermissions } = require('../middleware/authorizationMiddleware');
const {
  createShare,
  accessShare,
  revokeShare,
  getUserShares,
  validateShare,
  updateShare
} = require('../controllers/fileShareController');

// Rate limiting for share access attempts
const rateLimit = require('express-rate-limit');
const shareAccessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

// Public routes (still requires authentication)
router.get('/validate/:token', authenticate, validateShare);
router.post('/access/:token', shareAccessLimiter, authenticate, accessShare);

// Protected routes (requires specific permissions)
router.use(authenticate);
router.use(requirePermissions(['file.share']));

// Create and manage shares
router.post('/', createShare);
router.get('/my-shares', getUserShares);
router.put('/:shareId', updateShare);
router.delete('/:shareId', revokeShare);

module.exports = router;
