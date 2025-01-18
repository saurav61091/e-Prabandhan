const admin = require('firebase-admin');
const DeviceToken = require('../models/DeviceToken');
const { Op } = require('sequelize');

class PushNotificationService {
  constructor() {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
    }
  }

  // Send notification to a single user
  async sendToUser(userId, title, body, data = {}) {
    try {
      const devices = await DeviceToken.findAll({
        where: {
          userId,
          isActive: true
        }
      });

      const messages = devices.map(device => ({
        token: device.pushToken,
        notification: {
          title,
          body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      }));

      if (messages.length > 0) {
        const response = await admin.messaging().sendAll(messages);
        console.log('Successfully sent messages:', response);
        
        // Handle failed tokens
        response.responses.forEach(async (resp, idx) => {
          if (!resp.success) {
            if (resp.error.code === 'messaging/invalid-registration-token' ||
                resp.error.code === 'messaging/registration-token-not-registered') {
              await DeviceToken.update(
                { isActive: false },
                { where: { pushToken: messages[idx].token } }
              );
            }
          }
        });

        return response;
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Send notification to multiple users
  async sendToUsers(userIds, title, body, data = {}) {
    try {
      const devices = await DeviceToken.findAll({
        where: {
          userId: {
            [Op.in]: userIds
          },
          isActive: true
        }
      });

      const messages = devices.map(device => ({
        token: device.pushToken,
        notification: {
          title,
          body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
      }));

      if (messages.length > 0) {
        const response = await admin.messaging().sendAll(messages);
        return response;
      }
    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }

  // Send notification to a topic
  async sendToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        topic,
        notification: {
          title,
          body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw error;
    }
  }

  // Subscribe devices to a topic
  async subscribeToTopic(tokens, topic) {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      return response;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  // Unsubscribe devices from a topic
  async unsubscribeFromTopic(tokens, topic) {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      return response;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }
}

module.exports = new PushNotificationService();
