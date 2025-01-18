const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowInstance = sequelize.define('WorkflowInstance', {
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
  fileId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Files',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled', 'error'),
    defaultValue: 'active'
  },
  currentSteps: {
    type: DataTypes.JSON,
    defaultValue: []
    /* Current step structure:
    {
      stepId: string,
      status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'error',
      assignedTo: string[],
      startedAt: Date,
      deadline: Date,
      completedAt: Date,
      decisions: [{
        userId: string,
        decision: string,
        remarks: string,
        timestamp: Date
      }],
      formData: object,
      metadata: object
    }
    */
  },
  completedSteps: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  variables: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  error: {
    type: DataTypes.JSON,
    allowNull: true
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
      fields: ['fileId']
    },
    {
      fields: ['status']
    }
  ]
});

// Define associations
WorkflowInstance.associate = (models) => {
  WorkflowInstance.belongsTo(models.WorkflowTemplate, {
    foreignKey: 'templateId',
    as: 'template'
  });
  WorkflowInstance.belongsTo(models.File, {
    foreignKey: 'fileId',
    as: 'file'
  });
  WorkflowInstance.hasMany(models.WorkflowStep, {
    foreignKey: 'workflowId',
    as: 'steps'
  });
};

module.exports = WorkflowInstance;
