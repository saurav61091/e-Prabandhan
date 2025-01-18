const WorkflowTemplate = require('../models/WorkflowTemplate');
const WorkflowInstance = require('../models/WorkflowInstance');
const WorkflowStep = require('../models/WorkflowStep');
const workflowEngine = require('../services/workflowEngine');
const { Op } = require('sequelize');

// Template Management
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

// Workflow Instance Management
const startWorkflow = async (req, res) => {
  try {
    const { fileId, templateId } = req.body;
    const workflow = await workflowEngine.startWorkflow(fileId, templateId, req.user.id);
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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

// Step Management
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
