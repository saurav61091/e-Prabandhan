/**
 * User Model
 * 
 * Represents a user in the system. This model handles user authentication,
 * role-based access control, and user profile management.
 * 
 * @module models/User
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateTOTP, verifyTOTP } = require('../utils/mfa');

/**
 * User Model
 * 
 * Represents a user in the system. This model handles user authentication,
 * role-based access control, and user profile management.
 * 
 * @class User
 * @extends Sequelize.Model
 */
const User = sequelize.define('User', {
  /**
   * Unique identifier for the user
   * @property id
   * @type {number}
   * @default auto-increment
   */
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  /**
   * Username chosen by the user
   * @property username
   * @type {string}
   * @required
   * @unique
   */
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  /**
   * Email address of the user
   * @property email
   * @type {string}
   * @required
   * @unique
   */
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  /**
   * Password for the user
   * @property password
   * @type {string}
   * @required
   */
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  /**
   * Role of the user in the system
   * @property role
   * @type {string}
   * @enum ['ADMIN', 'USER', 'MANAGER', 'APPROVER']
   * @required
   */
  role: {
    type: DataTypes.ENUM('ADMIN', 'USER', 'MANAGER', 'APPROVER'),
    allowNull: false
  },
  /**
   * Department ID of the user
   * @property departmentId
   * @type {number}
   * @references {Department.id}
   */
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  /**
   * Designation ID of the user
   * @property designationId
   * @type {number}
   * @references {Designation.id}
   */
  designationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'designations',
      key: 'id'
    }
  },
  /**
   * Whether the user is active or not
   * @property isActive
   * @type {boolean}
   * @default true
   */
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  /**
   * Whether MFA is enabled for the user
   * @property mfaEnabled
   * @type {boolean}
   * @default false
   */
  mfaEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  /**
   * MFA secret for the user
   * @property mfaSecret
   * @type {string}
   */
  mfaSecret: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  /**
   * Last login date of the user
   * @property lastLogin
   * @type {date}
   */
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  /**
   * Number of login attempts made by the user
   * @property loginAttempts
   * @type {number}
   * @default 0
   */
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  /**
   * Date until which the user is locked out
   * @property lockUntil
   * @type {date}
   */
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  /**
   * Date when the user last changed their password
   * @property passwordLastChanged
   * @type {date}
   */
  passwordLastChanged: {
    type: DataTypes.DATE,
    allowNull: true
  },
  /**
   * Whether the user needs to change their password
   * @property requirePasswordChange
   * @type {boolean}
   * @default false
   */
  requirePasswordChange: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  /**
   * User preferences
   * @property preferences
   * @type {object}
   * @default {}
   */
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  /**
   * Hooks for the User model
   */
  hooks: {
    /**
     * Hash password before creating/updating user
     * @param {User} user - User instance being created/updated
     */
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
        user.password = await bcrypt.hash(user.password, salt);
      }
      user.passwordLastChanged = new Date();
      
      // Generate MFA secret if MFA is enabled
      if (user.mfaEnabled && !user.mfaSecret) {
        user.mfaSecret = generateTOTP.generateSecret();
      }
    },
    /**
     * Hash password before updating user
     * @param {User} user - User instance being updated
     */
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
        user.password = await bcrypt.hash(user.password, salt);
        user.passwordLastChanged = new Date();
        user.requirePasswordChange = false;
      }
      
      // Generate MFA secret if MFA is being enabled
      if (user.changed('mfaEnabled') && user.mfaEnabled && !user.mfaSecret) {
        user.mfaSecret = generateTOTP.generateSecret();
      }
    }
  }
});

/**
 * Instance methods for the User model
 */
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.incrementLoginAttempts = async function() {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  this.loginAttempts += 1;
  
  if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME);
  }
  
  await this.save();
};

User.prototype.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = null;
  await this.save();
};

User.prototype.isLocked = function() {
  return this.lockUntil && this.lockUntil > new Date();
};

User.prototype.verifyMFAToken = function(token) {
  if (!this.mfaEnabled || !this.mfaSecret) return false;
  return verifyTOTP(token, this.mfaSecret);
};

User.prototype.getMFAQRCode = async function() {
  if (!this.mfaEnabled || !this.mfaSecret) return null;
  return generateTOTP.generateQRCode(
    this.mfaSecret,
    this.email,
    process.env.MFA_ISSUER || 'e-Prabandhan'
  );
};

User.prototype.shouldChangePassword = function() {
  if (this.requirePasswordChange) return true;
  
  const passwordAge = this.passwordLastChanged ? 
    (new Date() - this.passwordLastChanged) / (1000 * 60 * 60 * 24) : 0;
  
  // Force password change after 90 days
  return passwordAge > 90;
};

/**
 * Model associations for the User model
 */
User.associate = function(models) {
  User.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });
  
  User.belongsTo(models.Designation, {
    foreignKey: 'designationId',
    as: 'designation'
  });
  
  User.hasMany(models.Document, {
    foreignKey: 'createdBy',
    as: 'documents'
  });
  
  User.hasMany(models.DocumentApproval, {
    foreignKey: 'approverId',
    as: 'approvals'
  });
  
  User.hasMany(models.AuditLog, {
    foreignKey: 'userId',
    as: 'auditLogs'
  });
};

module.exports = User;
