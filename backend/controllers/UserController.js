const BaseController = require('./BaseController');
const UserService = require('../services/UserService');
const { validateEmail, validatePassword } = require('../utils/validators');

class UserController extends BaseController {
  constructor() {
    super(new UserService());
  }

  // Register new user
  register = this.handleAsync(async (req, res) => {
    const { email, password, ...userData } = req.body;

    // Validate email and password
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements'
      });
    }

    const user = await this.service.create({
      email,
      password,
      ...userData
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });

  // Login user
  login = this.handleAsync(async (req, res) => {
    const { email, password, mfaToken } = req.body;

    const result = await this.service.login(email, password);
    
    // Check if MFA is required
    if (result.user.mfaEnabled && !mfaToken) {
      return res.json({
        success: true,
        requireMFA: true,
        userId: result.user.id
      });
    }

    // Verify MFA if provided
    if (mfaToken) {
      await this.service.verifyMFA(result.user.id, mfaToken);
    }

    res.json({
      success: true,
      data: result
    });
  });

  // Setup MFA
  setupMFA = this.handleAsync(async (req, res) => {
    const userId = req.user.id;
    const mfaData = await this.service.setupMFA(userId);

    res.json({
      success: true,
      data: mfaData
    });
  });

  // Verify MFA
  verifyMFA = this.handleAsync(async (req, res) => {
    const { token } = req.body;
    const userId = req.user.id;

    await this.service.verifyMFA(userId, token);

    res.json({
      success: true,
      message: 'MFA verified successfully'
    });
  });

  // Change password
  changePassword = this.handleAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements'
      });
    }

    await this.service.changePassword(userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  });

  // Reset user password (admin only)
  resetPassword = this.handleAsync(async (req, res) => {
    const { userId } = req.params;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const tempPassword = await this.service.resetPassword(userId);

    res.json({
      success: true,
      data: {
        temporaryPassword: tempPassword
      }
    });
  });

  // Get user profile
  getProfile = this.handleAsync(async (req, res) => {
    const userId = req.user.id;
    const profile = await this.service.getProfile(userId);

    res.json({
      success: true,
      data: profile
    });
  });

  // Update user profile
  updateProfile = this.handleAsync(async (req, res) => {
    const userId = req.user.id;
    const updatedProfile = await this.service.updateProfile(userId, req.body);

    res.json({
      success: true,
      data: updatedProfile
    });
  });

  // Lock user account (admin only)
  lockAccount = this.handleAsync(async (req, res) => {
    const { userId } = req.params;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    await this.service.lockAccount(userId);

    res.json({
      success: true,
      message: 'Account locked successfully'
    });
  });
}

module.exports = UserController;
