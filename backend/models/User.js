const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateTOTP, verifyTOTP } = require('../utils/mfa');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'USER', 'MANAGER', 'APPROVER'),
    allowNull: false
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  designationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'designations',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  mfaEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mfaSecret: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  passwordLastChanged: {
    type: DataTypes.DATE,
    allowNull: true
  },
  requirePasswordChange: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  hooks: {
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

// Instance methods
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

// Model associations
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
