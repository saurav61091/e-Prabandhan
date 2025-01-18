const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'DOWNLOAD', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT']]
    }
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['USER', 'DOCUMENT', 'WORKFLOW', 'DEPARTMENT', 'DESIGNATION', 'SYSTEM']]
    }
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  oldValue: {
    type: DataTypes.JSON,
    allowNull: true
  },
  newValue: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    validate: {
      isIP: true
    }
  },
  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILURE', 'WARNING'),
    defaultValue: 'SUCCESS'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['action']
    },
    {
      fields: ['entityType', 'entityId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Static methods
AuditLog.logAction = async function(data) {
  const {
    userId,
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
    metadata,
    status,
    errorMessage,
    sessionId
  } = data;

  try {
    // Create audit log entry
    const log = await this.create({
      userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
      metadata,
      status,
      errorMessage,
      sessionId
    });

    // If configured, send alerts for certain actions or statuses
    if (process.env.ENABLE_AUDIT_ALERTS === 'true') {
      if (status === 'FAILURE' || 
          action === 'DELETE' || 
          (metadata && metadata.sensitive === true)) {
        await sequelize.models.AlertService.sendAlert({
          type: 'AUDIT_ALERT',
          severity: status === 'FAILURE' ? 'HIGH' : 'MEDIUM',
          message: `Audit alert for ${action} on ${entityType}`,
          data: {
            log: {
              id: log.id,
              action,
              entityType,
              entityId,
              status,
              errorMessage
            }
          }
        });
      }
    }

    return log;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Even if alerting fails, we should still log the error
    return await this.create({
      action,
      entityType: 'SYSTEM',
      status: 'FAILURE',
      errorMessage: `Failed to create audit log: ${error.message}`
    });
  }
};

AuditLog.getActivityReport = async function(options = {}) {
  const {
    startDate,
    endDate,
    userId,
    action,
    entityType,
    status,
    limit = 100,
    offset = 0
  } = options;

  const where = {};
  
  if (startDate) where.createdAt = { [sequelize.Op.gte]: startDate };
  if (endDate) where.createdAt = { ...where.createdAt, [sequelize.Op.lte]: endDate };
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (status) where.status = status;

  return await this.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'username', 'email']
    }]
  });
};

// Model associations
AuditLog.associate = function(models) {
  AuditLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = AuditLog;
