const Joi = require('joi');

const shareSchema = {
  create: Joi.object({
    fileId: Joi.string().uuid().required(),
    recipientEmails: Joi.array().items(
      Joi.string().email()
    ).min(0),
    expiresAt: Joi.date().greater('now').allow(null),
    accessType: Joi.string().valid('view', 'download', 'edit').default('view'),
    password: Joi.string().min(6).allow(null),
    maxDownloads: Joi.number().integer().min(1).allow(null),
    notifyOnAccess: Joi.boolean().default(false),
    departmentOnly: Joi.boolean().default(false)
  }),

  update: Joi.object({
    expiresAt: Joi.date().greater('now').allow(null),
    accessType: Joi.string().valid('view', 'download', 'edit'),
    password: Joi.string().min(6).allow(null),
    maxDownloads: Joi.number().integer().min(1).allow(null),
    notifyOnAccess: Joi.boolean(),
    departmentOnly: Joi.boolean()
  }).min(1) // At least one field must be provided
};

module.exports = {
  shareSchema
};
