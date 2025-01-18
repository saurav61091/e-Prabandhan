const Joi = require('joi');

const stepSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  type: Joi.string().valid('approval', 'review', 'sign', 'route', 'notify', 'condition', 'action').required(),
  description: Joi.string(),
  assignTo: Joi.object({
    type: Joi.string().valid('user', 'role', 'department', 'dynamic').required(),
    value: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).required()
  }).required(),
  deadline: Joi.object({
    type: Joi.string().valid('fixed', 'dynamic').required(),
    value: Joi.when('type', {
      is: 'fixed',
      then: Joi.number().required(),
      otherwise: Joi.optional()
    }),
    formula: Joi.when('type', {
      is: 'dynamic',
      then: Joi.string().required(),
      otherwise: Joi.optional()
    })
  }),
  dependencies: Joi.array().items(Joi.string()),
  parallel: Joi.boolean(),
  requiredApprovals: Joi.number().integer().min(1),
  conditions: Joi.array().items(Joi.object({
    field: Joi.string().required(),
    operator: Joi.string().required(),
    value: Joi.any().required()
  })),
  actions: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    config: Joi.object()
  })),
  formConfig: Joi.object(),
  notifications: Joi.array().items(Joi.object({
    event: Joi.string().required(),
    template: Joi.string().required(),
    recipients: Joi.object({
      type: Joi.string().valid('user', 'role', 'department').required(),
      value: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string())
      ).required()
    })
  }))
});

const workflowTemplateSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  department: Joi.string().required(),
  fileTypes: Joi.array().items(Joi.string()),
  steps: Joi.array().items(stepSchema).min(1).required(),
  sla: Joi.object({
    warningThreshold: Joi.number().integer().min(1),
    autoReassign: Joi.boolean(),
    backupAssignees: Joi.object().pattern(
      Joi.string(),
      Joi.array().items(Joi.string())
    )
  }),
  active: Joi.boolean()
});

const workflowActionSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject', 'review', 'sign', 'complete').required(),
  remarks: Joi.string(),
  formData: Joi.object()
});

const validateWorkflowTemplate = (req, res, next) => {
  const { error } = workflowTemplateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({ errors });
  }
  next();
};

const validateWorkflowAction = (req, res, next) => {
  const { error } = workflowActionSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = {
  validateWorkflowTemplate,
  validateWorkflowAction
};
