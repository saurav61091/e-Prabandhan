const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowTemplate = sequelize.define('WorkflowTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileTypes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
    /* Step structure:
    {
      id: string,
      name: string,
      type: 'approval' | 'review' | 'sign' | 'route' | 'notify' | 'condition' | 'action',
      description: string,
      assignTo: {
        type: 'user' | 'role' | 'department' | 'dynamic',
        value: string | string[]
      },
      deadline: {
        type: 'fixed' | 'dynamic',
        value: number,
        formula: string
      },
      dependencies: string[],
      parallel: boolean,
      requiredApprovals: number,
      conditions: [{
        field: string,
        operator: string,
        value: any
      }],
      actions: [{
        type: string,
        config: object
      }],
      formConfig: object,
      notifications: [{
        event: string,
        template: string,
        recipients: object
      }]
    }
    */
  },
  sla: {
    type: DataTypes.JSON,
    defaultValue: {
      warningThreshold: 2,
      autoReassign: false,
      backupAssignees: {}
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['department']
    },
    {
      fields: ['createdBy']
    }
  ]
});

// Define associations
WorkflowTemplate.associate = (models) => {
  WorkflowTemplate.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  WorkflowTemplate.hasMany(models.WorkflowInstance, {
    foreignKey: 'templateId',
    as: 'instances'
  });
};

module.exports = WorkflowTemplate;
