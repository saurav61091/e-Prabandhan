const FileShareService = require('../services/fileShareService');
const createError = require('http-errors');
const { validateSchema } = require('../utils/validation');
const { shareSchema } = require('../validation/fileShareSchema');

// Create a new file share
const createShare = async (req, res) => {
  try {
    const {
      fileId,
      recipientEmails,
      expiresAt,
      accessType,
      password,
      maxDownloads,
      notifyOnAccess,
      departmentOnly
    } = await validateSchema(shareSchema.create, req.body);

    const share = await FileShareService.createShare({
      fileId,
      userId: req.user.id,
      recipientEmails,
      expiresAt,
      accessType,
      password,
      maxDownloads,
      notifyOnAccess,
      departmentOnly
    });

    res.json({
      message: 'File share created successfully',
      share: {
        id: share.id,
        shareToken: share.shareToken,
        expiresAt: share.expiresAt,
        accessType: share.accessType
      }
    });
  } catch (error) {
    console.error('Create share error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error creating file share'
    });
  }
};

// Access shared file
const accessShare = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const shareAccess = await FileShareService.accessShare(
      token,
      req.user,
      password
    );

    res.json({
      message: 'Share access granted',
      file: shareAccess.file,
      accessType: shareAccess.accessType
    });
  } catch (error) {
    console.error('Access share error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error accessing shared file'
    });
  }
};

// Revoke file share
const revokeShare = async (req, res) => {
  try {
    const { shareId } = req.params;

    await FileShareService.revokeShare(shareId, req.user.id);

    res.json({
      message: 'File share revoked successfully'
    });
  } catch (error) {
    console.error('Revoke share error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error revoking file share'
    });
  }
};

// Get user's shared files
const getUserShares = async (req, res) => {
  try {
    const shares = await FileShareService.getUserShares(req.user.id);

    res.json({
      shares: shares.map(share => ({
        id: share.id,
        file: {
          id: share.File.id,
          name: share.File.name,
          size: share.File.size,
          mimeType: share.File.mimeType
        },
        shareToken: share.shareToken,
        expiresAt: share.expiresAt,
        accessType: share.accessType,
        status: share.status,
        recipients: share.recipients.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email
        }))
      }))
    });
  } catch (error) {
    console.error('Get user shares error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving shared files'
    });
  }
};

// Validate share before access
const validateShare = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const share = await FileShareService.validateShare(token, password);

    res.json({
      valid: true,
      requiresPassword: !!share.password && !password,
      file: {
        name: share.File.name,
        size: share.File.size,
        mimeType: share.File.mimeType
      }
    });
  } catch (error) {
    // Don't expose detailed errors to client
    res.json({
      valid: false,
      requiresPassword: error.message === 'Password required'
    });
  }
};

// Update share settings
const updateShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const updates = await validateSchema(shareSchema.update, req.body);

    const share = await FileShare.findOne({
      where: {
        id: shareId,
        createdBy: req.user.id,
        status: 'active'
      }
    });

    if (!share) {
      throw createError(404, 'Share not found');
    }

    // Update share settings
    await share.update(updates);

    res.json({
      message: 'Share settings updated successfully',
      share: {
        id: share.id,
        expiresAt: share.expiresAt,
        accessType: share.accessType,
        maxDownloads: share.maxDownloads,
        notifyOnAccess: share.notifyOnAccess,
        departmentOnly: share.departmentOnly
      }
    });
  } catch (error) {
    console.error('Update share error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error updating share settings'
    });
  }
};

module.exports = {
  createShare,
  accessShare,
  revokeShare,
  getUserShares,
  validateShare,
  updateShare
};
