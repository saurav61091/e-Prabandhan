const BaseService = require('./BaseService');
const { User, Department, Designation } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  // Create a new user
  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return super.create({
      ...data,
      password: hashedPassword
    });
  }

  // Find user by email
  async findByEmail(email) {
    return this.findOne({ email });
  }

  // Login user
  async login(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Update last login
    await user.update({
      lastLogin: new Date(),
      loginAttempts: 0
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      },
      token
    };
  }

  // Setup MFA
  async setupMFA(userId) {
    const secret = speakeasy.generateSecret({
      name: process.env.APP_NAME || 'e-Prabandhan'
    });

    const user = await this.findById(userId);
    await user.update({
      mfaSecret: secret.base32,
      mfaEnabled: false
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    return {
      secret: secret.base32,
      qrCode
    };
  }

  // Verify MFA
  async verifyMFA(userId, token) {
    const user = await this.findById(userId);
    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
    });

    if (!isValid) {
      throw new Error('Invalid MFA token');
    }

    if (!user.mfaEnabled) {
      await user.update({ mfaEnabled: true });
    }

    return true;
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.findById(userId);
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
      passwordLastChanged: new Date(),
      requirePasswordChange: false
    });

    return true;
  }

  // Reset password
  async resetPassword(userId) {
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await this.update(userId, {
      password: hashedPassword,
      requirePasswordChange: true
    });

    return tempPassword;
  }

  // Get user profile with department and designation
  async getProfile(userId) {
    return this.findOne(
      { id: userId },
      {
        include: [
          {
            model: Department,
            as: 'department'
          },
          {
            model: Designation,
            as: 'designation'
          }
        ]
      }
    );
  }

  // Update user profile
  async updateProfile(userId, data) {
    // Remove sensitive fields that shouldn't be updated
    const { password, role, mfaSecret, ...updateData } = data;
    return this.update(userId, updateData);
  }

  // Lock user account
  async lockAccount(userId) {
    const lockDuration = parseInt(process.env.ACCOUNT_LOCK_DURATION || 30);
    const lockUntil = new Date(Date.now() + lockDuration * 60000);
    
    return this.update(userId, {
      lockUntil,
      loginAttempts: 0
    });
  }

  // Handle failed login attempt
  async handleFailedLogin(userId) {
    const user = await this.findById(userId);
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || 5);
    
    const attempts = user.loginAttempts + 1;
    if (attempts >= maxAttempts) {
      return this.lockAccount(userId);
    }

    return this.update(userId, {
      loginAttempts: attempts
    });
  }
}

module.exports = UserService;
