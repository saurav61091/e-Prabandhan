const express = require('express');
const router = express.Router();
const WorkflowNotificationService = require('../services/WorkflowNotificationService');
const { authenticateToken } = require('../middleware/auth');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      limit = 10,
      offset = 0,
      unreadOnly = false,
      type,
      priority
    } = req.query;

    const notifications = await WorkflowNotificationService.getUserNotifications(
      req.user.id,
      {
        limit: parseInt(limit),
        offset: parseInt(offset),
        unreadOnly: unreadOnly === 'true',
        type,
        priority
      }
    );

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const count = await WorkflowNotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await WorkflowNotificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read/all', authenticateToken, async (req, res) => {
  try {
    const { types } = req.query;
    await WorkflowNotificationService.markAllAsRead(
      req.user.id,
      types ? types.split(',') : null
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Create a custom notification
router.post('/custom', authenticateToken, async (req, res) => {
  try {
    const notification = await WorkflowNotificationService.createNotification({
      ...req.body,
      userId: req.user.id
    });
    res.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Update notification preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, notificationTypes } = req.body;
    
    // Update user preferences in User model
    await req.user.update({
      notificationPreferences: {
        email: emailNotifications,
        push: pushNotifications,
        types: notificationTypes
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

module.exports = router;
