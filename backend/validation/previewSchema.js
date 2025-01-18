const Joi = require('joi');

const previewSchema = {
  // Schema for file preview
  preview: Joi.object({
    fileId: Joi.string().uuid().required(),
    type: Joi.string().valid('thumbnail', 'medium', 'full', 'text').default('thumbnail')
  }),

  // Schema for preview metadata
  metadata: Joi.object({
    fileId: Joi.string().uuid().required()
  })
};

module.exports = {
  previewSchema
};
