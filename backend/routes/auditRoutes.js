const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorizationMiddleware');
const {
  getAuditLogs,
  getAuditLogDetails,
  getAuditStats,
  getUserTimeline,
  getResourceHistory,
  cleanupAuditLogs
} = require('../controllers/auditController');

// Middleware to check required roles
const requireRoles = (...roles) => authorize(roles);

// Base authentication for all routes
router.use(authenticate);

// Routes that require admin access
router.get('/', requireRoles('admin'), getAuditLogs);
router.get('/stats', requireRoles('admin'), getAuditStats);
router.post('/cleanup', requireRoles('admin'), cleanupAuditLogs);

// Routes that allow manager access
router.get('/details/:id', requireRoles('admin', 'manager'), getAuditLogDetails);
router.get('/user/:userId/timeline', requireRoles('admin', 'manager'), getUserTimeline);

// Resource history can be accessed by users with appropriate clearance
router.get('/resource/:resourceType/:resourceId', 
  authenticate, // Already authenticated, but explicit for clarity
  async (req, res, next) => {
    try {
      const { resourceType, resourceId } = req.params;
      
      // Check if user has access to the resource
      // This will vary based on resource type
      const canAccess = await checkResourceAccess(req.user, resourceType, resourceId);
      
      if (!canAccess) {
        return res.status(403).json({
          error: 'You do not have permission to view this resource\'s history'
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  },
  getResourceHistory
);

// Helper function to check resource access
async function checkResourceAccess(user, resourceType, resourceId) {
  try {
    // Admin has access to all resources
    if (user.role === 'admin') return true;

    // For files, check file access
    if (resourceType === 'file') {
      const File = require('../models/File');
      const file = await File.findByPk(resourceId);
      if (!file) return false;
      return file.canAccess(user);
    }

    // For users, only allow access to own timeline or subordinates
    if (resourceType === 'user') {
      if (user.id === resourceId) return true;
      if (user.role === 'manager') {
        const targetUser = await User.findByPk(resourceId);
        return targetUser && targetUser.department === user.department;
      }
      return false;
    }

    // For departments, allow access to own department
    if (resourceType === 'department') {
      return user.department === resourceId;
    }

    // Default to false for unknown resource types
    return false;
  } catch (error) {
    console.error('Resource access check error:', error);
    return false;
  }
}

module.exports = router;
