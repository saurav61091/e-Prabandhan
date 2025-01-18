const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { encryptData, decryptData } = require('./encryptionService');

class MFAService {
  static BACKUP_CODES_COUNT = 10;
  static BACKUP_CODE_LENGTH = 10;

  // Generate MFA secret for a user
  static async generateSecret(userId, email) {
    try {
      const secret = speakeasy.generateSecret({
        length: 20,
        name: `E-Prabandhan:${email}`
      });

      // Generate backup codes
      const backupCodes = await this.generateBackupCodes();
      
      // Encrypt secret and backup codes
      const encryptedSecret = await encryptData(secret.base32);
      const encryptedBackupCodes = await encryptData(backupCodes);

      // Update user with MFA details
      await User.findByIdAndUpdate(userId, {
        mfa: {
          enabled: false,
          secret: encryptedSecret,
          backupCodes: encryptedBackupCodes,
          verified: false
        }
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      return {
        qrCode,
        secret: secret.base32,
        backupCodes
      };
    } catch (error) {
      console.error('Error generating MFA secret:', error);
      throw new Error('Failed to generate MFA credentials');
    }
  }

  // Verify TOTP token
  static async verifyToken(userId, token) {
    try {
      const user = await User.findById(userId).select('+mfa');
      if (!user || !user.mfa || !user.mfa.secret) {
        throw new Error('MFA not set up for user');
      }

      // Decrypt secret
      const secret = await decryptData(user.mfa.secret);

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 30 seconds clock skew
      });

      if (!verified) {
        // Check if it's a backup code
        if (user.mfa.backupCodes) {
          const backupCodes = await decryptData(user.mfa.backupCodes);
          const codeIndex = backupCodes.indexOf(token);
          
          if (codeIndex !== -1) {
            // Remove used backup code
            backupCodes.splice(codeIndex, 1);
            const encryptedBackupCodes = await encryptData(backupCodes);
            
            await User.findByIdAndUpdate(userId, {
              'mfa.backupCodes': encryptedBackupCodes
            });
            
            return true;
          }
        }
        return false;
      }

      // If this is the first verification, mark MFA as verified
      if (!user.mfa.verified) {
        await User.findByIdAndUpdate(userId, {
          'mfa.verified': true,
          'mfa.enabled': true
        });
      }

      return true;
    } catch (error) {
      console.error('Error verifying MFA token:', error);
      throw new Error('Failed to verify MFA token');
    }
  }

  // Generate backup codes
  static async generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      const code = crypto.randomBytes(Math.ceil(this.BACKUP_CODE_LENGTH / 2))
        .toString('hex')
        .slice(0, this.BACKUP_CODE_LENGTH)
        .toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Disable MFA for a user
  static async disableMFA(userId, token) {
    try {
      // Verify token before disabling
      const verified = await this.verifyToken(userId, token);
      if (!verified) {
        throw new Error('Invalid MFA token');
      }

      await User.findByIdAndUpdate(userId, {
        mfa: {
          enabled: false,
          secret: null,
          backupCodes: null,
          verified: false
        }
      });

      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      throw new Error('Failed to disable MFA');
    }
  }

  // Generate new backup codes
  static async regenerateBackupCodes(userId, token) {
    try {
      // Verify token before generating new codes
      const verified = await this.verifyToken(userId, token);
      if (!verified) {
        throw new Error('Invalid MFA token');
      }

      const backupCodes = await this.generateBackupCodes();
      const encryptedBackupCodes = await encryptData(backupCodes);

      await User.findByIdAndUpdate(userId, {
        'mfa.backupCodes': encryptedBackupCodes
      });

      return backupCodes;
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      throw new Error('Failed to regenerate backup codes');
    }
  }

  // Check if user has MFA enabled
  static async isMFAEnabled(userId) {
    try {
      const user = await User.findById(userId).select('+mfa');
      return user && user.mfa && user.mfa.enabled && user.mfa.verified;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      throw new Error('Failed to check MFA status');
    }
  }

  // Get remaining backup codes count
  static async getBackupCodesCount(userId) {
    try {
      const user = await User.findById(userId).select('+mfa');
      if (!user || !user.mfa || !user.mfa.backupCodes) return 0;

      const backupCodes = await decryptData(user.mfa.backupCodes);
      return backupCodes.length;
    } catch (error) {
      console.error('Error getting backup codes count:', error);
      throw new Error('Failed to get backup codes count');
    }
  }
}

module.exports = MFAService;
