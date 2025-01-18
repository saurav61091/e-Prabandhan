const EncryptionService = require('../services/encryptionService');
const File = require('../models/File');
const createError = require('http-errors');
const { validateSchema } = require('../utils/validation');
const { encryptionSchema } = require('../validation/encryptionSchema');
const auditService = require('../services/auditService');

/**
 * Encrypt a file
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const encryptFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { password } = req.body;

    // Validate parameters
    await validateSchema(encryptionSchema.encrypt, {
      fileId,
      password
    });

    // Get file details
    const file = await File.findOne({
      where: {
        id: fileId,
        [Op.or]: [
          { createdBy: req.user.id },
          { departmentId: req.user.departmentId }
        ]
      }
    });

    if (!file) {
      throw createError(404, 'File not found');
    }

    if (file.isEncrypted) {
      throw createError(400, 'File is already encrypted');
    }

    // Encrypt the file
    const result = await EncryptionService.encryptFile(
      file.path,
      file.path + '.enc'
    );

    // Update file record
    await file.update({
      isEncrypted: true,
      encryptionKey: result.key,
      path: result.path
    });

    // Log the encryption action
    await auditService.logActivity({
      userId: req.user.id,
      action: 'FILE_ENCRYPTED',
      resourceType: 'file',
      resourceId: file.id,
      metadata: {
        fileName: file.name,
        fileType: file.fileType
      }
    });

    res.json({
      message: 'File encrypted successfully'
    });
  } catch (error) {
    console.error('Encrypt file error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error encrypting file'
    });
  }
};

/**
 * Decrypt a file
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const decryptFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { password } = req.body;

    // Validate parameters
    await validateSchema(encryptionSchema.decrypt, {
      fileId,
      password
    });

    // Get file details
    const file = await File.findOne({
      where: {
        id: fileId,
        [Op.or]: [
          { createdBy: req.user.id },
          { departmentId: req.user.departmentId }
        ]
      }
    });

    if (!file) {
      throw createError(404, 'File not found');
    }

    if (!file.isEncrypted) {
      throw createError(400, 'File is not encrypted');
    }

    // Decrypt the file
    const result = await EncryptionService.decryptFile(
      file.path,
      file.encryptionKey,
      file.path.replace('.enc', '')
    );

    // Update file record
    await file.update({
      isEncrypted: false,
      encryptionKey: null,
      path: result.path
    });

    // Log the decryption action
    await auditService.logActivity({
      userId: req.user.id,
      action: 'FILE_DECRYPTED',
      resourceType: 'file',
      resourceId: file.id,
      metadata: {
        fileName: file.name,
        fileType: file.fileType
      }
    });

    res.json({
      message: 'File decrypted successfully'
    });
  } catch (error) {
    console.error('Decrypt file error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error decrypting file'
    });
  }
};

/**
 * Re-encrypt a file with a new key
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const reEncryptFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Validate parameters
    await validateSchema(encryptionSchema.reEncrypt, {
      fileId,
      oldPassword,
      newPassword
    });

    // Get file details
    const file = await File.findOne({
      where: {
        id: fileId,
        [Op.or]: [
          { createdBy: req.user.id },
          { departmentId: req.user.departmentId }
        ]
      }
    });

    if (!file) {
      throw createError(404, 'File not found');
    }

    if (!file.isEncrypted) {
      throw createError(400, 'File is not encrypted');
    }

    // Create temporary decrypted copy
    const tempPath = await EncryptionService.createTempDecryptedCopy(
      file.path,
      file.encryptionKey
    );

    try {
      // Re-encrypt with new key
      const result = await EncryptionService.encryptFile(
        tempPath,
        file.path
      );

      // Update file record
      await file.update({
        encryptionKey: result.key
      });

      // Log the re-encryption action
      await auditService.logActivity({
        userId: req.user.id,
        action: 'FILE_REENCRYPTED',
        resourceType: 'file',
        resourceId: file.id,
        metadata: {
          fileName: file.name,
          fileType: file.fileType
        }
      });

      res.json({
        message: 'File re-encrypted successfully'
      });
    } finally {
      // Clean up temporary file
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  } catch (error) {
    console.error('Re-encrypt file error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error re-encrypting file'
    });
  }
};

/**
 * Get file encryption status
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getEncryptionStatus = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Validate parameters
    await validateSchema(encryptionSchema.status, {
      fileId
    });

    // Get file details
    const file = await File.findOne({
      where: {
        id: fileId,
        [Op.or]: [
          { createdBy: req.user.id },
          { departmentId: req.user.departmentId },
          { isPublic: true },
          { sharedWith: { [Op.contains]: [req.user.id] } }
        ]
      },
      attributes: ['id', 'name', 'isEncrypted', 'createdAt', 'updatedAt']
    });

    if (!file) {
      throw createError(404, 'File not found');
    }

    res.json({
      id: file.id,
      name: file.name,
      isEncrypted: file.isEncrypted,
      encryptedAt: file.isEncrypted ? file.updatedAt : null
    });
  } catch (error) {
    console.error('Get encryption status error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error getting encryption status'
    });
  }
};

module.exports = {
  encryptFile,
  decryptFile,
  reEncryptFile,
  getEncryptionStatus
};
