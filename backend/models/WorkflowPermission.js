const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowPermission = sequelize.define('WorkflowPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'WorkflowTemplates',
      key: 'id'
    }
  },
  entityType: {
    type: DataTypes.ENUM('user', 'role', 'department'),
    allowNull: false
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    /* Permission structure:
    {
      view: boolean,
      edit: boolean,
      delete: boolean,
      manage: boolean,
      start: boolean,
      assign: boolean,
      reassign: boolean,
      cancel: boolean,
      viewMetrics: boolean,
      exportData: boolean
    }
    */
  },
  conditions: {
    type: DataTypes.JSON,
    defaultValue: null,
    /* Conditions structure:
    {
      fileTypes: string[],
      departments: string[],
      metadata: object,
      custom: object
    }
    */
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['templateId']
    },
    {
      fields: ['entityType', 'entityId']
    },
    {
      fields: ['createdBy']
    }
  ]
});

// Define associations
WorkflowPermission.associate = (models) => {
  WorkflowPermission.belongsTo(models.WorkflowTemplate, {
    foreignKey: 'templateId',
    as: 'template'
  });

  WorkflowPermission.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
};

// Instance methods
WorkflowPermission.prototype.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

WorkflowPermission.prototype.hasAnyPermission = function(permissions) {
  return permissions.some(permission => this.permissions[permission] === true);
};

WorkflowPermission.prototype.hasAllPermissions = function(permissions) {
  return permissions.every(permission => this.permissions[permission] === true);
};

// Static methods
WorkflowPermission.findEffectivePermissions = async function(templateId, user) {
  const permissions = await this.findAll({
    where: {
      templateId,
      [sequelize.Op.or]: [
        { entityType: 'user', entityId: user.id },
        { entityType: 'role', entityId: user.role },
        { entityType: 'department', entityId: user.department }
      ]
    },
    order: [['priority', 'DESC']]
  });

  // Merge permissions with priority handling
  const effectivePermissions = {};
  permissions.forEach(permission => {
    Object.entries(permission.permissions).forEach(([key, value]) => {
      if (effectivePermissions[key] === undefined) {
        effectivePermissions[key] = value;
      }
    });
  });

  return effectivePermissions;
};

module.exports = WorkflowPermission;
