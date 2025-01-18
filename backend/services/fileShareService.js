const crypto = require('crypto');
const { Op } = require('sequelize');
const File = require('../models/File');
const FileShare = require('../models/FileShare');
const User = require('../models/User');
const AuditService = require('./auditService');
const EncryptionService = require('./encryptionService');

class FileShareService {
  /**
   * Create a new file share
   * @param {Object} params Share parameters
   * @returns {Promise<FileShare>} Created file share
   */
  static async createShare({
    fileId,
    userId,
    recipientEmails,
    expiresAt,
    accessType = 'view',
    password = null,
    maxDownloads = null,
    notifyOnAccess = false,
    departmentOnly = false
  }) {
    try {
      const file = await File.findByPk(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      // Generate a unique share token
      const shareToken = crypto.randomBytes(32).toString('hex');

      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        hashedPassword = await EncryptionService.hashPassword(password);
      }

      // Create share record
      const share = await FileShare.create({
        fileId,
        createdBy: userId,
        shareToken,
        expiresAt,
        accessType,
        password: hashedPassword,
        maxDownloads,
        remainingDownloads: maxDownloads,
        notifyOnAccess,
        departmentOnly,
        status: 'active'
      });

      // Add recipients
      if (recipientEmails && recipientEmails.length > 0) {
        const recipients = await User.findAll({
          where: {
            email: {
              [Op.in]: recipientEmails
            }
          }
        });

        await share.setRecipients(recipients);

        // Log share creation
        await AuditService.log({
          userId,
          action: 'create_share',
          category: 'file',
          status: 'success',
          severity: 'medium',
          resourceId: fileId,
          resourceType: 'file',
          metadata: {
            shareId: share.id,
            recipientCount: recipients.length,
            expiresAt,
            accessType
          }
        });
      }

      return share;
    } catch (error) {
      console.error('Create share error:', error);
      throw error;
    }
  }

  /**
   * Validate and get file share
   * @param {string} shareToken Share token
   * @param {string} password Optional password
   * @returns {Promise<FileShare>} File share if valid
   */
  static async validateShare(shareToken, password = null) {
    try {
      const share = await FileShare.findOne({
        where: {
          shareToken,
          status: 'active',
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } }
          ]
        },
        include: [
          {
            model: File,
            attributes: ['id', 'name', 'path', 'size', 'mimeType']
          }
        ]
      });

      if (!share) {
        throw new Error('Share link is invalid or expired');
      }

      // Check remaining downloads
      if (share.maxDownloads && share.remainingDownloads <= 0) {
        throw new Error('Download limit reached');
      }

      // Verify password if required
      if (share.password) {
        if (!password) {
          throw new Error('Password required');
        }
        const validPassword = await EncryptionService.verifyPassword(
          password,
          share.password
        );
        if (!validPassword) {
          throw new Error('Invalid password');
        }
      }

      return share;
    } catch (error) {
      console.error('Validate share error:', error);
      throw error;
    }
  }

  /**
   * Access shared file
   * @param {string} shareToken Share token
   * @param {Object} user Requesting user
   * @param {string} password Optional password
   * @returns {Promise<Object>} File access details
   */
  static async accessShare(shareToken, user, password = null) {
    try {
      const share = await this.validateShare(shareToken, password);

      // Check department restriction
      if (share.departmentOnly && user.department !== share.createdBy.department) {
        throw new Error('Access restricted to department members only');
      }

      // Check recipient restriction
      if (share.recipients && share.recipients.length > 0) {
        const isRecipient = share.recipients.some(r => r.id === user.id);
        if (!isRecipient) {
          throw new Error('Access restricted to specified recipients only');
        }
      }

      // Update download count if applicable
      if (share.maxDownloads) {
        await share.decrement('remainingDownloads');
      }

      // Log access
      await AuditService.log({
        userId: user.id,
        action: 'access_share',
        category: 'file',
        status: 'success',
        severity: 'low',
        resourceId: share.fileId,
        resourceType: 'file',
        metadata: {
          shareId: share.id,
          accessType: share.accessType
        }
      });

      // Notify owner if enabled
      if (share.notifyOnAccess) {
        // Implement notification logic here
      }

      return {
        file: share.File,
        accessType: share.accessType
      };
    } catch (error) {
      console.error('Access share error:', error);
      throw error;
    }
  }

  /**
   * Revoke file share
   * @param {string} shareId Share ID
   * @param {string} userId Requesting user ID
   * @returns {Promise<boolean>} Success status
   */
  static async revokeShare(shareId, userId) {
    try {
      const share = await FileShare.findByPk(shareId);
      
      if (!share) {
        throw new Error('Share not found');
      }

      if (share.createdBy !== userId) {
        throw new Error('Unauthorized to revoke this share');
      }

      await share.update({ status: 'revoked' });

      // Log revocation
      await AuditService.log({
        userId,
        action: 'revoke_share',
        category: 'file',
        status: 'success',
        severity: 'medium',
        resourceId: share.fileId,
        resourceType: 'file',
        metadata: {
          shareId: share.id
        }
      });

      return true;
    } catch (error) {
      console.error('Revoke share error:', error);
      throw error;
    }
  }

  /**
   * Get user's shared files
   * @param {string} userId User ID
   * @returns {Promise<Array>} List of shares
   */
  static async getUserShares(userId) {
    try {
      const shares = await FileShare.findAll({
        where: {
          createdBy: userId,
          status: 'active'
        },
        include: [
          {
            model: File,
            attributes: ['id', 'name', 'path', 'size', 'mimeType']
          },
          {
            model: User,
            as: 'recipients',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return shares;
    } catch (error) {
      console.error('Get user shares error:', error);
      throw error;
    }
  }

  /**
   * Clean up expired shares
   * @returns {Promise<number>} Number of shares cleaned
   */
  static async cleanupExpiredShares() {
    try {
      const result = await FileShare.update(
        { status: 'expired' },
        {
          where: {
            status: 'active',
            expiresAt: {
              [Op.lt]: new Date()
            }
          }
        }
      );

      return result[0];
    } catch (error) {
      console.error('Cleanup shares error:', error);
      throw error;
    }
  }
}

module.exports = FileShareService;
