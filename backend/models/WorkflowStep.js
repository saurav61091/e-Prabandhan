const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkflowStep = sequelize.define('WorkflowStep', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  workflowId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workflows',
      key: 'id'
    }
  },
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  designationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'designations',
      key: 'id'
    }
  },
  isMandatory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  approvalType: {
    type: DataTypes.ENUM('SEQUENTIAL', 'PARALLEL'),
    defaultValue: 'SEQUENTIAL'
  },
  minApprovals: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  deadline: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Deadline in hours for this step'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  conditions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  actions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  notifyEmails: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  reminderInterval: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reminder interval in hours'
  },
  escalateAfter: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Hours after which to escalate'
  },
  escalateToDesignationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'designations',
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      fields: ['workflowId', 'stepNumber'],
      unique: true
    },
    {
      fields: ['designationId']
    }
  ]
});

// Instance methods
WorkflowStep.prototype.getApprovers = async function() {
  return await sequelize.models.User.findAll({
    where: {
      designationId: this.designationId,
      isActive: true
    }
  });
};

WorkflowStep.prototype.shouldEscalate = function(startTime) {
  if (!this.escalateAfter) return false;
  const hoursElapsed = (Date.now() - startTime) / (1000 * 60 * 60);
  return hoursElapsed >= this.escalateAfter;
};

WorkflowStep.prototype.validateConditions = async function(document) {
  if (!this.conditions || Object.keys(this.conditions).length === 0) {
    return true;
  }

  // Example condition validation
  const { amount, department, documentType } = this.conditions;
  
  if (amount && document.metadata.amount) {
    if (amount.min && document.metadata.amount < amount.min) return false;
    if (amount.max && document.metadata.amount > amount.max) return false;
  }

  if (department && document.departmentId !== department) return false;
  if (documentType && document.metadata.type !== documentType) return false;

  return true;
};

WorkflowStep.prototype.executeActions = async function(approval) {
  if (!this.actions || Object.keys(this.actions).length === 0) {
    return;
  }

  // Execute configured actions
  for (const action of Object.values(this.actions)) {
    switch (action.type) {
      case 'EMAIL':
        await sequelize.models.EmailService.sendEmail({
          to: action.to,
          template: action.template,
          data: { approval, step: this }
        });
        break;
      case 'NOTIFICATION':
        await sequelize.models.Notification.create({
          userId: action.userId,
          type: action.notificationType,
          data: { approval, step: this }
        });
        break;
      case 'WEBHOOK':
        await sequelize.models.WebhookService.trigger(action.url, {
          approval, step: this
        });
        break;
    }
  }
};

// Model associations
WorkflowStep.associate = function(models) {
  WorkflowStep.belongsTo(models.Workflow, {
    foreignKey: 'workflowId',
    as: 'workflow'
  });

  WorkflowStep.belongsTo(models.Designation, {
    foreignKey: 'designationId',
    as: 'designation'
  });

  WorkflowStep.belongsTo(models.Designation, {
    foreignKey: 'escalateToDesignationId',
    as: 'escalateToDesignation'
  });

  WorkflowStep.hasMany(models.DocumentApproval, {
    foreignKey: 'workflowStepId',
    as: 'approvals'
  });
};

module.exports = WorkflowStep;
