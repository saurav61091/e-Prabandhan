const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getNotificationStats,
  sendDepartmentNotification,
  updateNotificationPreferences,
  sendTaskReminders,
  sendDailyDigest
} = require('../controllers/notificationController');

// Rate limiting for notification endpoints
const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all notification routes
router.use(notificationLimiter);

// User notification routes
router.get('/', auth, getUserNotifications);
router.get('/stats', auth, getNotificationStats);
router.put('/preferences', auth, updateNotificationPreferences);
router.put('/:notificationId/read', auth, markAsRead);
router.put('/mark-all-read', auth, markAllAsRead);
router.put('/:notificationId/archive', auth, archiveNotification);

// Department notification routes (manager only)
router.post('/department', 
  auth, 
  authorize(['manager', 'admin']), 
  sendDepartmentNotification
);

// Manual trigger endpoints (admin only)
router.post('/send-task-reminders', 
  auth, 
  authorize(['admin']), 
  sendTaskReminders
);

router.post('/send-daily-digest', 
  auth, 
  authorize(['admin']), 
  sendDailyDigest
);

module.exports = router;
