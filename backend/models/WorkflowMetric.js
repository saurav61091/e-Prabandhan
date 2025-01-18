const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowMetric = sequelize.define('WorkflowMetric', {
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
  workflowId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'WorkflowInstances',
      key: 'id'
    }
  },
  stepId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'WorkflowSteps',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'workflow_start',
      'workflow_complete',
      'workflow_cancel',
      'step_start',
      'step_complete',
      'step_reassign',
      'step_escalate',
      'sla_breach',
      'error'
    ),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in seconds
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  slaStatus: {
    type: DataTypes.ENUM('within', 'warning', 'breached'),
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
      fields: ['workflowId']
    },
    {
      fields: ['stepId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['department']
    },
    {
      fields: ['userId']
    }
  ]
});

// Define associations
WorkflowMetric.associate = (models) => {
  WorkflowMetric.belongsTo(models.WorkflowTemplate, {
    foreignKey: 'templateId',
    as: 'template'
  });

  WorkflowMetric.belongsTo(models.WorkflowInstance, {
    foreignKey: 'workflowId',
    as: 'workflow'
  });

  WorkflowMetric.belongsTo(models.WorkflowStep, {
    foreignKey: 'stepId',
    as: 'step'
  });

  WorkflowMetric.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// Static methods for analytics
WorkflowMetric.getTemplateMetrics = async function(templateId, startDate, endDate) {
  const metrics = await this.findAll({
    where: {
      templateId,
      timestamp: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: sequelize.models.WorkflowInstance,
        as: 'workflow'
      },
      {
        model: sequelize.models.User,
        as: 'user'
      }
    ]
  });

  return {
    totalWorkflows: metrics.filter(m => m.type === 'workflow_start').length,
    completedWorkflows: metrics.filter(m => m.type === 'workflow_complete').length,
    cancelledWorkflows: metrics.filter(m => m.type === 'workflow_cancel').length,
    averageDuration: metrics
      .filter(m => m.type === 'workflow_complete' && m.duration)
      .reduce((acc, m) => acc + m.duration, 0) / metrics.filter(m => m.type === 'workflow_complete').length,
    slaBreaches: metrics.filter(m => m.type === 'sla_breach').length,
    stepMetrics: await this.getStepMetrics(metrics),
    userMetrics: await this.getUserMetrics(metrics),
    departmentMetrics: await this.getDepartmentMetrics(metrics)
  };
};

WorkflowMetric.getStepMetrics = async function(metrics) {
  const stepMetrics = {};
  
  metrics.forEach(metric => {
    if (!metric.stepId) return;
    
    if (!stepMetrics[metric.stepId]) {
      stepMetrics[metric.stepId] = {
        total: 0,
        completed: 0,
        escalated: 0,
        reassigned: 0,
        averageDuration: 0,
        slaBreaches: 0
      };
    }

    const stats = stepMetrics[metric.stepId];
    
    switch (metric.type) {
      case 'step_start':
        stats.total++;
        break;
      case 'step_complete':
        stats.completed++;
        if (metric.duration) {
          stats.averageDuration = (stats.averageDuration * (stats.completed - 1) + metric.duration) / stats.completed;
        }
        break;
      case 'step_escalate':
        stats.escalated++;
        break;
      case 'step_reassign':
        stats.reassigned++;
        break;
      case 'sla_breach':
        stats.slaBreaches++;
        break;
    }
  });

  return stepMetrics;
};

WorkflowMetric.getUserMetrics = async function(metrics) {
  const userMetrics = {};
  
  metrics.forEach(metric => {
    if (!metric.userId) return;
    
    if (!userMetrics[metric.userId]) {
      userMetrics[metric.userId] = {
        tasksCompleted: 0,
        averageResponseTime: 0,
        slaBreaches: 0
      };
    }

    const stats = userMetrics[metric.userId];
    
    if (metric.type === 'step_complete') {
      stats.tasksCompleted++;
      if (metric.duration) {
        stats.averageResponseTime = (stats.averageResponseTime * (stats.tasksCompleted - 1) + metric.duration) / stats.tasksCompleted;
      }
    } else if (metric.type === 'sla_breach') {
      stats.slaBreaches++;
    }
  });

  return userMetrics;
};

WorkflowMetric.getDepartmentMetrics = async function(metrics) {
  const departmentMetrics = {};
  
  metrics.forEach(metric => {
    if (!metric.department) return;
    
    if (!departmentMetrics[metric.department]) {
      departmentMetrics[metric.department] = {
        totalWorkflows: 0,
        completedWorkflows: 0,
        averageDuration: 0,
        slaBreaches: 0
      };
    }

    const stats = departmentMetrics[metric.department];
    
    switch (metric.type) {
      case 'workflow_start':
        stats.totalWorkflows++;
        break;
      case 'workflow_complete':
        stats.completedWorkflows++;
        if (metric.duration) {
          stats.averageDuration = (stats.averageDuration * (stats.completedWorkflows - 1) + metric.duration) / stats.completedWorkflows;
        }
        break;
      case 'sla_breach':
        stats.slaBreaches++;
        break;
    }
  });

  return departmentMetrics;
};

module.exports = WorkflowMetric;
