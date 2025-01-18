const MFAService = require('../services/mfaService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

// Setup MFA for a user
const setupMFA = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      throw createError(404, 'User not found');
    }

    if (user.mfa && user.mfa.enabled) {
      throw createError(400, 'MFA is already enabled');
    }

    const { qrCode, secret, backupCodes } = await MFAService.generateSecret(
      userId,
      user.email
    );

    res.json({
      qrCode,
      secret,
      backupCodes,
      message: 'MFA setup initiated. Please verify with a token to complete setup.'
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error setting up MFA'
    });
  }
};

// Verify MFA token during setup
const verifyMFASetup = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      throw createError(400, 'Token is required');
    }

    const verified = await MFAService.verifyToken(userId, token);
    if (!verified) {
      throw createError(400, 'Invalid token');
    }

    res.json({
      message: 'MFA setup completed successfully'
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error verifying MFA token'
    });
  }
};

// Verify MFA token during login
const verifyMFALogin = async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      throw createError(400, 'Token and userId are required');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw createError(404, 'User not found');
    }

    const verified = await MFAService.verifyToken(userId, token);
    if (!verified) {
      throw createError(401, 'Invalid token');
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Reset login attempts
    await user.resetLoginAttempts();

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('MFA login verification error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error verifying MFA token'
    });
  }
};

// Disable MFA
const disableMFA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      throw createError(400, 'Token is required');
    }

    await MFAService.disableMFA(userId, token);

    res.json({
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error disabling MFA'
    });
  }
};

// Generate new backup codes
const regenerateBackupCodes = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      throw createError(400, 'Token is required');
    }

    const backupCodes = await MFAService.regenerateBackupCodes(userId, token);

    res.json({
      backupCodes,
      message: 'New backup codes generated successfully'
    });
  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error generating new backup codes'
    });
  }
};

// Get MFA status
const getMFAStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const mfaEnabled = await MFAService.isMFAEnabled(userId);
    const backupCodesCount = await MFAService.getBackupCodesCount(userId);

    res.json({
      enabled: mfaEnabled,
      backupCodesRemaining: backupCodesCount
    });
  } catch (error) {
    console.error('MFA status check error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error checking MFA status'
    });
  }
};

module.exports = {
  setupMFA,
  verifyMFASetup,
  verifyMFALogin,
  disableMFA,
  regenerateBackupCodes,
  getMFAStatus
};
