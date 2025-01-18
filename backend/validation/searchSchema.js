const Joi = require('joi');

const searchSchema = {
  // Schema for file search
  search: Joi.object({
    query: Joi.string().min(1).max(500),
    fileTypes: Joi.string().pattern(/^[a-zA-Z0-9,]+$/),
    tags: Joi.string().pattern(/^[a-zA-Z0-9,\-_]+$/),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    creator: Joi.string().uuid(),
    lastModified: Joi.date().iso(),
    status: Joi.string().valid('active', 'archived', 'deleted'),
    metadataFilters: Joi.string().pattern(/^[a-zA-Z0-9,:\-_\[\]\(\)\|]+$/),
    sortString: Joi.string().pattern(/^[a-zA-Z0-9_]+:(asc|desc)$/),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // Schema for metadata search
  metadataSearch: Joi.object({
    field: Joi.string().required().pattern(/^[a-zA-Z0-9_]+$/),
    value: Joi.string().required().min(1).max(100),
    type: Joi.string().valid('prefix', 'term').default('prefix'),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

module.exports = {
  searchSchema
};
