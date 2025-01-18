const Joi = require('joi');

const employeeSchema = {
  // Schema for creating employee
  create: Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    departmentId: Joi.string().uuid().required(),
    position: Joi.string().required(),
    type: Joi.string().valid('full_time', 'part_time', 'contract', 'intern').required(),
    joinDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('joinDate')).allow(null),
    reportingTo: Joi.string().uuid().allow(null),
    designation: Joi.string().required(),
    grade: Joi.string().allow(null),
    location: Joi.string().allow(null),
    workPhone: Joi.string().pattern(/^\+?[\d\s-]+$/).allow(null),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().pattern(/^\+?[\d\s-]+$/).required()
    }).allow(null),
    skills: Joi.array().items(Joi.string()).default([]),
    certifications: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        issuer: Joi.string().required(),
        validUntil: Joi.date().iso().required()
      })
    ).default([]),
    education: Joi.array().items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().integer().min(1900).max(2100).required(),
        grade: Joi.string().allow(null)
      })
    ).default([]),
    documents: Joi.object({
      id_proof: Joi.object({
        type: Joi.string().required(),
        number: Joi.string().required()
      }).required(),
      address_proof: Joi.object({
        type: Joi.string().required(),
        number: Joi.string().required()
      }).required(),
      resume: Joi.object({
        version: Joi.number().default(1),
        lastUpdated: Joi.date().iso()
      }).required()
    }).required(),
    benefits: Joi.object().default({}),
    customFields: Joi.object().default({})
  }),

  // Schema for updating employee
  update: Joi.object({
    position: Joi.string(),
    status: Joi.string().valid('active', 'on_leave', 'terminated', 'suspended'),
    type: Joi.string().valid('full_time', 'part_time', 'contract', 'intern'),
    endDate: Joi.date().iso(),
    reportingTo: Joi.string().uuid().allow(null),
    designation: Joi.string(),
    grade: Joi.string().allow(null),
    location: Joi.string().allow(null),
    workPhone: Joi.string().pattern(/^\+?[\d\s-]+$/).allow(null),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().pattern(/^\+?[\d\s-]+$/).required()
    }),
    skills: Joi.array().items(Joi.string()),
    certifications: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        issuer: Joi.string().required(),
        validUntil: Joi.date().iso().required()
      })
    ),
    education: Joi.array().items(
      Joi.object({
        degree: Joi.string().required(),
        institution: Joi.string().required(),
        year: Joi.number().integer().min(1900).max(2100).required(),
        grade: Joi.string().allow(null)
      })
    ),
    documents: Joi.object(),
    benefits: Joi.object(),
    customFields: Joi.object()
  }).min(1),

  // Schema for searching employees
  search: Joi.object({
    query: Joi.string().allow(''),
    departmentId: Joi.string().uuid(),
    status: Joi.string().valid('active', 'on_leave', 'terminated', 'suspended'),
    type: Joi.string().valid('full_time', 'part_time', 'contract', 'intern'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid(
      'joinDate',
      'employeeId',
      'position',
      'type',
      'status'
    ).default('joinDate'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
  }),

  // Schema for document upload
  document: Joi.object({
    documentType: Joi.string().valid(
      'id_proof',
      'address_proof',
      'resume',
      'offer_letter',
      'contract',
      'certification',
      'performance_review',
      'other'
    ).required()
  })
};

module.exports = {
  employeeSchema
};
