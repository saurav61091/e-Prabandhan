const { Op } = require('sequelize');
const Notification = require('../models/Notification');
const User = require('../models/User');
const EmailService = require('./emailService');
const PushNotificationService = require('./pushNotificationService');
const SMSService = require('./smsService');
const WebSocketService = require('./webSocketService');
const config = require('../config/config');

class NotificationService {
  /**
   * Create a new notification
   * @param {Object} params Notification parameters
   * @returns {Promise<Notification>} Created notification
   */
  static async createNotification({
    userId,
    type,
    title,
    message,
    priority = 'low',
    metadata = null,
    actionUrl = null,
    expiresAt = null,
    channel = 'in_app',
    departmentId = null
  }) {
    try {
      // Create notification record
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        priority,
        metadata,
        actionUrl,
        expiresAt,
        channel,
        departmentId
      });

      // Send notification based on channel
      await this.sendNotification(notification);

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  /**
   * Send notification through specified channel
   * @param {Notification} notification Notification object
   * @private
   */
  static async sendNotification(notification) {
    try {
      const user = await User.findByPk(notification.userId);
      if (!user) {
        throw new Error('User not found');
      }

      switch (notification.channel) {
        case 'email':
          await EmailService.sendNotificationEmail(user.email, notification);
          break;

        case 'push':
          if (user.pushToken) {
            await PushNotificationService.sendPushNotification(
              user.pushToken,
              notification
            );
          }
          break;

        case 'sms':
          if (user.phone) {
            await SMSService.sendSMS(user.phone, notification.message);
          }
          break;

        case 'in_app':
          // Send real-time notification via WebSocket
          WebSocketService.sendToUser(user.id, 'notification', notification);
          break;
      }

      // Update delivery status
      await notification.update({ deliveryStatus: 'sent' });
    } catch (error) {
      console.error('Send notification error:', error);
      await notification.update({ deliveryStatus: 'failed' });
      throw error;
    }
  }

  /**
   * Get user's notifications
   * @param {string} userId User ID
   * @param {Object} filters Filter options
   * @param {Object} pagination Pagination options
   * @returns {Promise<Object>} Notifications and pagination info
   */
  static async getUserNotifications(userId, filters = {}, pagination = {}) {
    try {
      const {
        status,
        type,
        priority,
        startDate,
        endDate,
        search
      } = filters;

      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = pagination;

      const where = { userId };

      // Apply filters
      if (status) where.status = status;
      if (type) where.type = type;
      if (priority) where.priority = priority;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { message: { [Op.like]: `%${search}%` } }
        ];
      }

      // Get notifications with pagination
      const { rows: notifications, count } = await Notification.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      return {
        notifications,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   * @param {string} userId User ID
   * @returns {Promise<Object>} Notification statistics
   */
  static async getNotificationStats(userId) {
    try {
      const [
        unreadCount,
        priorityStats,
        typeStats
      ] = await Promise.all([
        Notification.count({
          where: {
            userId,
            status: 'unread'
          }
        }),
        Notification.count({
          where: { userId },
          group: ['priority']
        }),
        Notification.count({
          where: { userId },
          group: ['type']
        })
      ]);

      return {
        unreadCount,
        priorityStats,
        typeStats
      };
    } catch (error) {
      console.error('Get notification stats error:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications
   * @param {Array} notifications Array of notification objects
   * @returns {Promise<Array>} Created notifications
   */
  static async sendBulkNotifications(notifications) {
    try {
      const createdNotifications = await Promise.all(
        notifications.map(notification => this.createNotification(notification))
      );

      return createdNotifications;
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      throw error;
    }
  }

  /**
   * Send department notification
   * @param {Object} params Notification parameters
   * @returns {Promise<Array>} Created notifications
   */
  static async sendDepartmentNotification({
    departmentId,
    type,
    title,
    message,
    priority,
    metadata,
    actionUrl,
    channel
  }) {
    try {
      // Get all users in department
      const users = await User.findAll({
        where: { departmentId }
      });

      // Create notifications for each user
      const notifications = users.map(user => ({
        userId: user.id,
        type,
        title,
        message,
        priority,
        metadata,
        actionUrl,
        channel,
        departmentId
      }));

      return this.sendBulkNotifications(notifications);
    } catch (error) {
      console.error('Send department notification error:', error);
      throw error;
    }
  }

  /**
   * Clean up old notifications
   * @param {number} days Days to keep notifications
   * @returns {Promise<number>} Number of archived notifications
   */
  static async cleanupOldNotifications(days = 90) {
    try {
      return await Notification.archiveOldNotifications(days);
    } catch (error) {
      console.error('Cleanup notifications error:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
