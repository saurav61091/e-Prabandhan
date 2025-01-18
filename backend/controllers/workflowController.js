/**
 * Workflow Controller
 * 
 * Handles all workflow-related operations including:
 * - Creating and managing workflow templates
 * - Starting workflow instances
 * - Processing workflow steps
 * - Managing workflow assignments and transitions
 * 
 * @module controllers/workflowController
 */

const WorkflowTemplate = require('../models/WorkflowTemplate');
const WorkflowInstance = require('../models/WorkflowInstance');
const WorkflowStep = require('../models/WorkflowStep');
const workflowEngine = require('../services/workflowEngine');
const { Op } = require('sequelize');

/**
 * Template Management
 * 
 * Handles creation, retrieval, update, and deletion of workflow templates.
 */

/**
 * Create a new workflow template
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing workflow details
 * @param {string} req.body.name - Name of the workflow
 * @param {string} req.body.description - Description of the workflow
 * @param {Array} req.body.steps - Array of workflow steps
 * @param {Object} res - Express response object
 */
const createTemplate = async (req, res) => {
  try {
    const template = await WorkflowTemplate.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all workflow templates
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTemplates = async (req, res) => {
  try {
    const where = {};
    
    if (!req.user.isAdmin) {
      where[Op.or] = [
        { createdBy: req.user.id },
        { department: req.user.department }
      ];
    }

    if (req.query.department) {
      where.department = req.query.department;
    }

    const templates = await WorkflowTemplate.findAll({ where });
    res.json(templates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get a workflow template by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTemplateById = async (req, res) => {
  try {
    const template = await WorkflowTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update a workflow template
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTemplate = async (req, res) => {
  try {
    const template = await WorkflowTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!req.user.isAdmin && template.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await template.update(req.body);
    res.json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete a workflow template
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTemplate = async (req, res) => {
  try {
    const template = await WorkflowTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!req.user.isAdmin && template.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await template.destroy();
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Workflow Instance Management
 * 
 * Handles creation, retrieval, and cancellation of workflow instances.
 */

/**
 * Start a new workflow instance
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const startWorkflow = async (req, res) => {
  try {
    const { fileId, templateId } = req.body;
    const workflow = await workflowEngine.startWorkflow(fileId, templateId, req.user.id);
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all workflow instances for a file
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWorkflowsByFile = async (req, res) => {
  try {
    const workflows = await WorkflowInstance.findAll({
      where: { fileId: req.params.fileId },
      include: [
        {
          model: WorkflowTemplate,
          attributes: ['name', 'description']
        },
        {
          model: WorkflowStep,
          where: { status: 'active' },
          required: false
        }
      ]
    });
    res.json(workflows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get a workflow instance by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWorkflowById = async (req, res) => {
  try {
    const workflow = await WorkflowInstance.findByPk(req.params.id, {
      include: [
        {
          model: WorkflowTemplate,
          attributes: ['name', 'description', 'steps']
        },
        {
          model: WorkflowStep,
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Cancel a workflow instance
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowInstance.findByPk(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    if (!req.user.isAdmin && workflow.metadata.initiator !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await workflow.update({
      status: 'cancelled',
      completedAt: new Date(),
      metadata: {
        ...workflow.metadata,
        cancelledBy: req.user.id,
        cancelReason: req.body.reason
      }
    });

    // Cancel all active steps
    await WorkflowStep.update(
      {
        status: 'skipped',
        metadata: {
          skippedReason: 'Workflow cancelled',
          skippedBy: req.user.id
        }
      },
      {
        where: {
          workflowId: workflow.id,
          status: { [Op.in]: ['pending', 'in_progress'] }
        }
      }
    );

    res.json({ message: 'Workflow cancelled successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Step Management
 * 
 * Handles processing and reassignment of workflow steps.
 */

/**
 * Process a workflow step
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processStep = async (req, res) => {
  try {
    const { action, remarks, formData } = req.body;
    const step = await workflowEngine.processStep(req.params.stepId, req.user.id, action, {
      remarks,
      formData
    });
    res.json(step);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reassign a workflow step
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const reassignStep = async (req, res) => {
  try {
    const { assignTo } = req.body;
    const step = await WorkflowStep.findByPk(req.params.stepId);
    
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    if (!req.user.isAdmin && !step.assignedTo.includes(req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const assignedUsers = await workflowEngine.resolveAssignees(assignTo);
    await step.update({
      assignedTo: assignedUsers,
      metadata: {
        ...step.metadata,
        reassignedBy: req.user.id,
        reassignedAt: new Date(),
        previousAssignees: step.assignedTo
      }
    });

    // Send notifications to new assignees
    await workflowEngine.sendStepNotifications(step, {
      ...step.metadata,
      notifications: [{
        event: 'step_reassigned',
        template: 'stepReassigned',
        recipients: { type: 'user', value: assignedUsers }
      }]
    }, 'step_reassigned');

    res.json(step);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all tasks assigned to the current user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMyTasks = async (req, res) => {
  try {
    const steps = await WorkflowStep.findAll({
      where: {
        assignedTo: { [Op.contains]: [req.user.id] },
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      include: [
        {
          model: WorkflowInstance,
          include: [
            {
              model: WorkflowTemplate,
              attributes: ['name']
            }
          ]
        }
      ],
      order: [['deadline', 'ASC']]
    });

    res.json(steps);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  // Template Management
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,

  // Workflow Instance Management
  startWorkflow,
  getWorkflowsByFile,
  getWorkflowById,
  cancelWorkflow,

  // Step Management
  processStep,
  reassignStep,
  getMyTasks
};
