const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const Session = require('../models/Session');
const User = require('../models/User');
const AuditService = require('./auditService');
const config = require('../config/config');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

class SessionService {
  /**
   * Create a new session
   * @param {Object} user User object
   * @param {Object} deviceInfo Device information
   * @returns {Promise<Object>} Session tokens and info
   */
  static async createSession(user, deviceInfo) {
    try {
      const { userAgent, ipAddress } = deviceInfo;
      
      // Parse user agent
      const ua = new UAParser(userAgent);
      const browser = `${ua.getBrowser().name} ${ua.getBrowser().version}`;
      const os = `${ua.getOS().name} ${ua.getOS().version}`;
      const deviceType = this.getDeviceType(ua);
      
      // Get location info
      const geo = geoip.lookup(ipAddress);
      const location = geo ? {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        ll: geo.ll
      } : null;

      // Generate device ID if not provided
      const deviceId = deviceInfo.deviceId || 
        crypto.createHash('sha256')
          .update(`${user.id}-${browser}-${os}-${ipAddress}`)
          .digest('hex');

      // Check concurrent sessions limit
      await this.enforceConcurrentSessionsLimit(user.id, deviceType);

      // Generate tokens
      const token = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken();

      // Create session record
      const session = await Session.create({
        userId: user.id,
        token,
        refreshToken,
        deviceId,
        deviceType,
        deviceName: deviceInfo.deviceName,
        browser,
        os,
        ipAddress,
        location,
        mfaVerified: user.mfaEnabled ? false : true
      });

      // Log session creation
      await AuditService.log({
        userId: user.id,
        action: 'create_session',
        category: 'authentication',
        status: 'success',
        severity: 'medium',
        metadata: {
          sessionId: session.id,
          deviceType,
          browser,
          os,
          ipAddress
        }
      });

      return {
        token,
        refreshToken,
        expiresAt: session.expiresAt,
        sessionId: session.id
      };
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  /**
   * Validate session
   * @param {string} token Access token
   * @returns {Promise<Object>} Session info
   */
  static async validateSession(token) {
    try {
      const session = await Session.findOne({
        where: {
          token,
          status: 'active',
          expiresAt: {
            [Op.gt]: new Date()
          }
        },
        include: [{
          model: User,
          attributes: ['id', 'email', 'role', 'status', 'mfaEnabled']
        }]
      });

      if (!session) {
        throw new Error('Invalid or expired session');
      }

      if (session.user.status !== 'active') {
        await session.revoke();
        throw new Error('User account is not active');
      }

      // Update last activity
      await session.updateLastActivity();

      return {
        session,
        user: session.user
      };
    } catch (error) {
      console.error('Validate session error:', error);
      throw error;
    }
  }

  /**
   * Refresh session
   * @param {string} refreshToken Refresh token
   * @returns {Promise<Object>} New session tokens
   */
  static async refreshSession(refreshToken) {
    try {
      const session = await Session.findOne({
        where: {
          refreshToken,
          status: 'active',
          expiresAt: {
            [Op.gt]: new Date()
          }
        },
        include: [{
          model: User,
          attributes: ['id', 'email', 'role', 'status']
        }]
      });

      if (!session) {
        throw new Error('Invalid or expired refresh token');
      }

      if (session.user.status !== 'active') {
        await session.revoke();
        throw new Error('User account is not active');
      }

      // Generate new tokens
      const newToken = this.generateAccessToken(session.user);
      const newRefreshToken = this.generateRefreshToken();

      // Update session
      await session.update({
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)) // Extend by 24 hours
      });

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: session.expiresAt
      };
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  }

  /**
   * Revoke session
   * @param {string} sessionId Session ID
   * @param {string} userId User ID
   * @returns {Promise<boolean>} Success status
   */
  static async revokeSession(sessionId, userId) {
    try {
      const session = await Session.findOne({
        where: {
          id: sessionId,
          userId,
          status: 'active'
        }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      await session.revoke();

      // Log session revocation
      await AuditService.log({
        userId,
        action: 'revoke_session',
        category: 'authentication',
        status: 'success',
        severity: 'medium',
        metadata: {
          sessionId,
          deviceType: session.deviceType,
          browser: session.browser
        }
      });

      return true;
    } catch (error) {
      console.error('Revoke session error:', error);
      throw error;
    }
  }

  /**
   * Get user's active sessions
   * @param {string} userId User ID
   * @returns {Promise<Array>} List of active sessions
   */
  static async getUserSessions(userId) {
    try {
      const sessions = await Session.findAll({
        where: {
          userId,
          status: 'active',
          expiresAt: {
            [Op.gt]: new Date()
          }
        },
        order: [['lastActivity', 'DESC']]
      });

      return sessions;
    } catch (error) {
      console.error('Get user sessions error:', error);
      throw error;
    }
  }

  /**
   * Mark session as MFA verified
   * @param {string} sessionId Session ID
   * @returns {Promise<boolean>} Success status
   */
  static async markMFAVerified(sessionId) {
    try {
      const session = await Session.findByPk(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      await session.update({ mfaVerified: true });
      return true;
    } catch (error) {
      console.error('Mark MFA verified error:', error);
      throw error;
    }
  }

  /**
   * Enforce concurrent sessions limit
   * @param {string} userId User ID
   * @param {string} deviceType Device type
   * @private
   */
  static async enforceConcurrentSessionsLimit(userId, deviceType) {
    try {
      const maxSessions = deviceType === 'mobile' ? 2 : 3;
      
      const activeSessions = await Session.findAll({
        where: {
          userId,
          deviceType,
          status: 'active',
          expiresAt: {
            [Op.gt]: new Date()
          }
        },
        order: [['lastActivity', 'ASC']]
      });

      if (activeSessions.length >= maxSessions) {
        // Revoke oldest session
        const oldestSession = activeSessions[0];
        await oldestSession.revoke();

        // Log session revocation
        await AuditService.log({
          userId,
          action: 'revoke_session',
          category: 'authentication',
          status: 'success',
          severity: 'low',
          metadata: {
            sessionId: oldestSession.id,
            reason: 'concurrent_limit',
            deviceType
          }
        });
      }
    } catch (error) {
      console.error('Enforce sessions limit error:', error);
      throw error;
    }
  }

  /**
   * Generate access token
   * @param {Object} user User object
   * @private
   */
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  }

  /**
   * Generate refresh token
   * @private
   */
  static generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  }

  /**
   * Get device type from user agent
   * @param {Object} ua User agent parser result
   * @private
   */
  static getDeviceType(ua) {
    const device = ua.getDevice();
    if (device.type === 'mobile' || device.type === 'tablet') {
      return 'mobile';
    }
    return 'desktop';
  }
}

module.exports = SessionService;
