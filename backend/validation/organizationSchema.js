const Joi = require('joi');

const organizationSchema = {
  // Schema for creating organization
  create: Joi.object({
    name: Joi.string().required().min(2).max(100),
    code: Joi.string().pattern(/^[A-Z0-9-]+$/).max(10),
    type: Joi.string()
      .valid('company', 'division', 'department', 'unit', 'team')
      .required(),
    parentId: Joi.string().uuid().allow(null),
    managerId: Joi.string().uuid().allow(null),
    description: Joi.string().max(500),
    status: Joi.string()
      .valid('active', 'inactive', 'archived')
      .default('active'),
    budget: Joi.number().precision(2).positive().allow(null),
    costCenter: Joi.string().max(20).allow(null),
    location: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      postalCode: Joi.string().required()
    }).allow(null),
    contact: Joi.object({
      email: Joi.string().email(),
      phone: Joi.string().pattern(/^\+?[\d\s-]+$/),
      website: Joi.string().uri()
    }).allow(null),
    settings: Joi.object({
      allowSubUnits: Joi.boolean(),
      maxEmployees: Joi.number().integer().positive(),
      requiredDocuments: Joi.array().items(Joi.string()),
      customFields: Joi.object()
    }).default({})
  }),

  // Schema for updating organization
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    code: Joi.string().pattern(/^[A-Z0-9-]+$/).max(10),
    managerId: Joi.string().uuid().allow(null),
    description: Joi.string().max(500),
    status: Joi.string().valid('active', 'inactive', 'archived'),
    budget: Joi.number().precision(2).positive().allow(null),
    costCenter: Joi.string().max(20).allow(null),
    location: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      postalCode: Joi.string().required()
    }).allow(null),
    contact: Joi.object({
      email: Joi.string().email(),
      phone: Joi.string().pattern(/^\+?[\d\s-]+$/),
      website: Joi.string().uri()
    }).allow(null),
    settings: Joi.object({
      allowSubUnits: Joi.boolean(),
      maxEmployees: Joi.number().integer().positive(),
      requiredDocuments: Joi.array().items(Joi.string()),
      customFields: Joi.object()
    })
  }).min(1),

  // Schema for searching organizations
  search: Joi.object({
    query: Joi.string().allow(''),
    type: Joi.string().valid('company', 'division', 'department', 'unit', 'team'),
    status: Joi.string().valid('active', 'inactive', 'archived'),
    parentId: Joi.string().uuid(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid(
      'name',
      'code',
      'type',
      'status',
      'headcount'
    ).default('name'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC')
  }),

  // Schema for moving organization
  move: Joi.object({
    orgId: Joi.string().uuid().required(),
    newParentId: Joi.string().uuid().required().disallow(Joi.ref('orgId'))
  })
};

module.exports = {
  organizationSchema
};
