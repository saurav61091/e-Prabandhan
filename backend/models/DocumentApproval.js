const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentApproval = sequelize.define('DocumentApproval', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  documentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  workflowStepId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workflowsteps',
      key: 'id'
    }
  },
  approverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remindersSent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastReminderSent: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isEscalated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  escalatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  escalatedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  indexes: [
    {
      fields: ['documentId', 'workflowStepId', 'approverId'],
      unique: true
    },
    {
      fields: ['status']
    },
    {
      fields: ['deadline']
    }
  ]
});

// Instance methods
DocumentApproval.prototype.approve = async function(comments = null) {
  const transaction = await sequelize.transaction();
  
  try {
    this.status = 'APPROVED';
    this.comments = comments;
    this.approvedAt = new Date();
    await this.save({ transaction });

    // Get the document and workflow step
    const document = await this.getDocument({ transaction });
    const workflowStep = await this.getWorkflowStep({
      include: ['workflow'],
      transaction
    });

    // Check if this was the last approval needed
    const pendingApprovals = await DocumentApproval.count({
      where: {
        documentId: this.documentId,
        workflowStepId: this.workflowStepId,
        status: 'PENDING'
      },
      transaction
    });

    // If parallel approval and minimum approvals met, or if sequential and no pending approvals
    const minApprovalsmet = workflowStep.approvalType === 'PARALLEL' && 
      (await DocumentApproval.count({
        where: {
          documentId: this.documentId,
          workflowStepId: this.workflowStepId,
          status: 'APPROVED'
        },
        transaction
      })) >= (workflowStep.minApprovals || 1);

    if (pendingApprovals === 0 || minApprovalsmet) {
      // Create approvals for next step if exists
      const nextStep = await workflowStep.workflow.getWorkflowSteps({
        where: {
          stepNumber: workflowStep.stepNumber + 1
        },
        transaction
      });

      if (nextStep[0]) {
        const approvers = await nextStep[0].getApprovers();
        await Promise.all(approvers.map(approver => 
          DocumentApproval.create({
            documentId: this.documentId,
            workflowStepId: nextStep[0].id,
            approverId: approver.id,
            deadline: nextStep[0].deadline ? new Date(Date.now() + nextStep[0].deadline * 60 * 60 * 1000) : null
          }, { transaction })
        ));
      } else {
        // No more steps, mark document as approved
        document.status = 'APPROVED';
        await document.save({ transaction });
      }
    }

    // Execute any configured actions
    await workflowStep.executeActions(this);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

DocumentApproval.prototype.reject = async function(comments) {
  if (!comments) {
    throw new Error('Comments are required for rejection');
  }

  const transaction = await sequelize.transaction();
  
  try {
    this.status = 'REJECTED';
    this.comments = comments;
    this.approvedAt = new Date();
    await this.save({ transaction });

    // Get the document and update its status
    const document = await this.getDocument({ transaction });
    document.status = 'REJECTED';
    await document.save({ transaction });

    // Execute any configured actions
    const workflowStep = await this.getWorkflowStep();
    await workflowStep.executeActions(this);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

DocumentApproval.prototype.sendReminder = async function() {
  const workflowStep = await this.getWorkflowStep();
  if (!workflowStep.reminderInterval) return;

  const lastReminder = this.lastReminderSent || this.createdAt;
  const hoursSinceLastReminder = (Date.now() - lastReminder) / (1000 * 60 * 60);

  if (hoursSinceLastReminder >= workflowStep.reminderInterval) {
    this.remindersSent += 1;
    this.lastReminderSent = new Date();
    await this.save();

    // Send reminder notification
    const approver = await this.getApprover();
    const document = await this.getDocument();
    
    await sequelize.models.EmailService.sendEmail({
      to: approver.email,
      template: 'approval_reminder',
      data: {
        approver,
        document,
        approval: this,
        workflowStep
      }
    });
  }
};

DocumentApproval.prototype.checkEscalation = async function() {
  if (this.isEscalated) return;

  const workflowStep = await this.getWorkflowStep();
  if (!workflowStep.escalateAfter) return;

  const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  
  if (hoursSinceCreation >= workflowStep.escalateAfter) {
    const transaction = await sequelize.transaction();
    
    try {
      this.isEscalated = true;
      this.escalatedAt = new Date();
      
      if (workflowStep.escalateToDesignationId) {
        const escalationUser = await sequelize.models.User.findOne({
          where: {
            designationId: workflowStep.escalateToDesignationId,
            isActive: true
          },
          transaction
        });

        if (escalationUser) {
          this.escalatedTo = escalationUser.id;
          
          // Create a new approval for the escalation user
          await DocumentApproval.create({
            documentId: this.documentId,
            workflowStepId: this.workflowStepId,
            approverId: escalationUser.id,
            deadline: this.deadline
          }, { transaction });
        }
      }

      await this.save({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

// Model associations
DocumentApproval.associate = function(models) {
  DocumentApproval.belongsTo(models.Document, {
    foreignKey: 'documentId',
    as: 'document'
  });

  DocumentApproval.belongsTo(models.WorkflowStep, {
    foreignKey: 'workflowStepId',
    as: 'workflowStep'
  });

  DocumentApproval.belongsTo(models.User, {
    foreignKey: 'approverId',
    as: 'approver'
  });

  DocumentApproval.belongsTo(models.User, {
    foreignKey: 'escalatedTo',
    as: 'escalationUser'
  });
};

module.exports = DocumentApproval;
