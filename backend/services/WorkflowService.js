const BaseService = require('./BaseService');
const { 
  Workflow, 
  WorkflowStep, 
  DocumentApproval, 
  Document, 
  User, 
  Designation 
} = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendNotification } = require('../utils/notifications');

class WorkflowService extends BaseService {
  constructor() {
    super(Workflow);
  }

  // Create workflow with steps
  async create(data) {
    const transaction = await sequelize.transaction();

    try {
      const { steps, ...workflowData } = data;
      
      // Create workflow
      const workflow = await super.create(workflowData, transaction);

      // Create workflow steps
      if (steps && steps.length > 0) {
        await WorkflowStep.bulkCreate(
          steps.map(step => ({
            ...step,
            workflowId: workflow.id
          })),
          { transaction }
        );
      }

      await transaction.commit();
      return this.findById(workflow.id, {
        include: [{ model: WorkflowStep }]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get workflow with all details
  async getWorkflowDetails(workflowId) {
    return this.findOne(
      { id: workflowId },
      {
        include: [
          {
            model: WorkflowStep,
            include: [{
              model: Designation,
              attributes: ['id', 'name', 'level']
            }]
          }
        ]
      }
    );
  }

  // Process document approval
  async processApproval(documentId, userId, action, comments) {
    const transaction = await sequelize.transaction();

    try {
      // Get current approval step
      const approval = await DocumentApproval.findOne({
        where: {
          documentId,
          status: 'PENDING'
        },
        include: [
          {
            model: WorkflowStep,
            include: [{ model: Workflow }]
          }
        ],
        transaction
      });

      if (!approval) {
        throw new Error('No pending approval found');
      }

      // Update approval status
      await approval.update({
        status: action,
        comments,
        approvedAt: new Date()
      }, { transaction });

      // Get all approvals for current step
      const stepApprovals = await DocumentApproval.findAll({
        where: {
          documentId,
          workflowStepId: approval.workflowStepId
        },
        transaction
      });

      const step = approval.WorkflowStep;
      const workflow = step.Workflow;

      // Check if step is complete
      const isStepComplete = this.checkStepCompletion(stepApprovals, step);

      if (isStepComplete) {
        if (action === 'REJECTED') {
          // Reject document if step is rejected
          await Document.update(
            { status: 'REJECTED' },
            { 
              where: { id: documentId },
              transaction 
            }
          );
        } else {
          // Move to next step or complete workflow
          const nextStep = await WorkflowStep.findOne({
            where: {
              workflowId: workflow.id,
              stepNumber: step.stepNumber + 1
            },
            transaction
          });

          if (nextStep) {
            // Create approvals for next step
            await this.createStepApprovals(documentId, nextStep, transaction);
          } else {
            // Complete workflow
            await Document.update(
              { status: 'APPROVED' },
              { 
                where: { id: documentId },
                transaction 
              }
            );
          }
        }
      }

      await transaction.commit();

      // Send notifications
      await this.sendApprovalNotifications(documentId, action, userId);

      return this.getDocumentWorkflowStatus(documentId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Check if workflow step is complete
  checkStepCompletion(approvals, step) {
    const approvedCount = approvals.filter(a => a.status === 'APPROVED').length;
    const rejectedCount = approvals.filter(a => a.status === 'REJECTED').length;

    if (step.approvalType === 'PARALLEL') {
      // For parallel approval, check minimum approvals
      if (rejectedCount > 0) return true;
      return approvedCount >= (step.minApprovals || approvals.length);
    } else {
      // For sequential approval, all must approve
      return approvedCount === approvals.length || rejectedCount > 0;
    }
  }

  // Create approvals for a workflow step
  async createStepApprovals(documentId, step, transaction) {
    const users = await User.findAll({
      where: {
        designationId: step.designationId,
        isActive: true
      },
      transaction
    });

    const approvals = users.map(user => ({
      documentId,
      workflowStepId: step.id,
      approverId: user.id,
      status: 'PENDING',
      deadline: step.deadline ? new Date(Date.now() + step.deadline * 60000) : null
    }));

    await DocumentApproval.bulkCreate(approvals, { transaction });
  }

  // Get document workflow status
  async getDocumentWorkflowStatus(documentId) {
    const document = await Document.findByPk(documentId, {
      include: [
        {
          model: DocumentApproval,
          include: [
            {
              model: WorkflowStep,
              include: [{ model: Workflow }]
            },
            {
              model: User,
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ]
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return {
      documentId: document.id,
      status: document.status,
      approvals: document.DocumentApprovals.map(approval => ({
        id: approval.id,
        status: approval.status,
        comments: approval.comments,
        approvedAt: approval.approvedAt,
        deadline: approval.deadline,
        step: {
          number: approval.WorkflowStep.stepNumber,
          name: approval.WorkflowStep.name,
          type: approval.WorkflowStep.approvalType
        },
        approver: approval.User
      }))
    };
  }

  // Send notifications for approval actions
  async sendApprovalNotifications(documentId, action, userId) {
    const document = await Document.findByPk(documentId, {
      include: [
        {
          model: User,
          as: 'creator'
        }
      ]
    });

    // Notify document creator
    await sendNotification({
      userId: document.createdBy,
      type: 'DOCUMENT_STATUS',
      title: `Document ${action.toLowerCase()}`,
      message: `Your document "${document.title}" has been ${action.toLowerCase()}`
    });

    // Notify next approvers if approved
    if (action === 'APPROVED') {
      const pendingApprovals = await DocumentApproval.findAll({
        where: {
          documentId,
          status: 'PENDING'
        },
        include: [{ model: User }]
      });

      for (const approval of pendingApprovals) {
        await sendNotification({
          userId: approval.approverId,
          type: 'APPROVAL_REQUIRED',
          title: 'Document requires approval',
          message: `Document "${document.title}" requires your approval`
        });
      }
    }
  }
}

module.exports = WorkflowService;
