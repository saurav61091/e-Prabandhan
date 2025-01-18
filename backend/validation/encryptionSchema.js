const Joi = require('joi');

const encryptionSchema = {
  // Schema for file encryption
  encrypt: Joi.object({
    fileId: Joi.string().uuid().required(),
    password: Joi.string().min(8).max(100).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .message('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  }),

  // Schema for file decryption
  decrypt: Joi.object({
    fileId: Joi.string().uuid().required(),
    password: Joi.string().min(8).max(100).required()
  }),

  // Schema for file re-encryption
  reEncrypt: Joi.object({
    fileId: Joi.string().uuid().required(),
    oldPassword: Joi.string().min(8).max(100).required(),
    newPassword: Joi.string().min(8).max(100).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .message('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
      .disallow(Joi.ref('oldPassword'))
      .messages({
        'any.invalid': 'New password must be different from the old password'
      })
  }),

  // Schema for encryption status
  status: Joi.object({
    fileId: Joi.string().uuid().required()
  })
};

module.exports = {
  encryptionSchema
};
