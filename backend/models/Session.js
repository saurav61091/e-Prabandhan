const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true
  },
  os: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true
  },
  lastActivity: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'revoked'),
    allowNull: false,
    defaultValue: 'active'
  },
  mfaVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['token']
    },
    {
      fields: ['refreshToken']
    },
    {
      fields: ['deviceId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['expiresAt']
    }
  ],
  hooks: {
    beforeCreate: async (session) => {
      // Set expiration based on session type (e.g., mobile vs web)
      const isMobileDevice = session.deviceType === 'mobile';
      const expirationHours = isMobileDevice ? 720 : 24; // 30 days for mobile, 24 hours for web
      session.expiresAt = new Date(Date.now() + (expirationHours * 60 * 60 * 1000));
    }
  }
});

// Define associations
Session.associate = (models) => {
  Session.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// Instance methods
Session.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

Session.prototype.isActive = function() {
  return this.status === 'active' && !this.isExpired();
};

Session.prototype.updateLastActivity = async function() {
  this.lastActivity = new Date();
  await this.save();
};

Session.prototype.revoke = async function() {
  this.status = 'revoked';
  await this.save();
};

// Static methods
Session.cleanupExpiredSessions = async function() {
  try {
    const result = await this.update(
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
    console.error('Cleanup sessions error:', error);
    throw error;
  }
};

Session.revokeUserSessions = async function(userId, exceptSessionId = null) {
  try {
    const where = { userId, status: 'active' };
    if (exceptSessionId) {
      where.id = { [Op.ne]: exceptSessionId };
    }
    
    const result = await this.update(
      { status: 'revoked' },
      { where }
    );
    return result[0];
  } catch (error) {
    console.error('Revoke user sessions error:', error);
    throw error;
  }
};

module.exports = Session;
