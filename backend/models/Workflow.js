const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Workflow = sequelize.define('Workflow', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  type: {
    type: DataTypes.ENUM('SEQUENTIAL', 'PARALLEL', 'CONDITIONAL'),
    defaultValue: 'SEQUENTIAL'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  conditions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  minApprovals: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  maxDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maximum duration in hours for workflow completion'
  }
});

// Instance methods
Workflow.prototype.getCurrentStep = async function(documentId) {
  const document = await sequelize.models.Document.findByPk(documentId, {
    include: [{
      model: sequelize.models.DocumentApproval,
      as: 'approvals',
      include: ['workflowStep']
    }]
  });

  if (!document) return null;

  // Get all workflow steps
  const steps = await this.getWorkflowSteps({
    order: [['stepNumber', 'ASC']]
  });

  // Find the first pending step
  for (const step of steps) {
    const approval = document.approvals.find(a => a.workflowStepId === step.id);
    if (!approval || approval.status === 'PENDING') {
      return step;
    }
    if (approval.status === 'REJECTED') {
      return null; // Workflow stopped due to rejection
    }
  }

  return null; // All steps completed
};

Workflow.prototype.isCompleted = async function(documentId) {
  const currentStep = await this.getCurrentStep(documentId);
  return !currentStep;
};

Workflow.prototype.getApprovers = async function(stepNumber) {
  const step = await this.getWorkflowSteps({
    where: { stepNumber },
    include: [{
      model: sequelize.models.Designation,
      as: 'designation',
      include: [{
        model: sequelize.models.User,
        as: 'users',
        where: { isActive: true }
      }]
    }]
  });

  if (!step[0]) return [];
  return step[0].designation.users;
};

Workflow.prototype.validateWorkflow = function() {
  if (this.type === 'PARALLEL' && !this.minApprovals) {
    throw new Error('Parallel workflows must specify minimum required approvals');
  }

  if (this.type === 'CONDITIONAL' && !this.conditions) {
    throw new Error('Conditional workflows must specify conditions');
  }
};

// Model associations
Workflow.associate = function(models) {
  Workflow.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });

  Workflow.hasMany(models.WorkflowStep, {
    foreignKey: 'workflowId',
    as: 'workflowSteps'
  });

  Workflow.hasMany(models.Document, {
    foreignKey: 'workflowId',
    as: 'documents'
  });
};

module.exports = Workflow;
