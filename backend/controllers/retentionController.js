const RetentionPolicy = require('../models/RetentionPolicy');
const File = require('../models/File');
const User = require('../models/User');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const { sendEmail } = require('../utils/emailService');
const { logFileAccess } = require('../utils/auditLogger');
const { encryptFile } = require('../utils/encryption');

// Check files against retention policies and take appropriate action
const processRetention = async () => {
  try {
    const activePolicies = await RetentionPolicy.findAll({
      where: { isActive: true }
    });

    for (const policy of activePolicies) {
      // Find files that match this policy's criteria
      const files = await File.findAll({
        where: {
          type: { [Op.in]: policy.fileTypes },
          ...(policy.department && { department: policy.department }),
          status: { [Op.notIn]: ['archived', 'deleted'] },
          retentionDate: {
            [Op.lte]: new Date()
          }
        }
      });

      for (const file of files) {
        await processFileRetention(file, policy);
      }
    }
  } catch (error) {
    console.error('Error processing retention:', error);
  }
};

// Process retention for a single file
const processFileRetention = async (file, policy) => {
  try {
    // Check if approval is required and not yet obtained
    if (policy.requireApproval && !file.retentionApproved) {
      await requestRetentionApproval(file, policy);
      return;
    }

    if (policy.action === 'archive') {
      await archiveFile(file, policy);
    } else if (policy.action === 'delete') {
      await deleteFile(file, policy);
    }

    // Notify relevant users
    if (policy.autoNotify) {
      await notifyRetentionAction(file, policy);
    }
  } catch (error) {
    console.error(`Error processing retention for file ${file.id}:`, error);
  }
};

// Archive a file
const archiveFile = async (file, policy) => {
  try {
    const archivePath = path.join(policy.archivePath, file.fileNumber);
    
    // Create archive directory if it doesn't exist
    await fs.mkdir(path.dirname(archivePath), { recursive: true });

    // Move file to archive
    await fs.rename(file.path, archivePath);

    // Update file record
    await file.update({
      path: archivePath,
      status: 'archived',
      archivedAt: new Date(),
      archivedBy: 'system',
      archivePolicy: policy.id
    });

    // Log the action
    await logFileAccess(file.id, 'system', 'archive', {
      policyId: policy.id,
      archivePath
    });
  } catch (error) {
    throw new Error(`Failed to archive file: ${error.message}`);
  }
};

// Delete a file
const deleteFile = async (file, policy) => {
  try {
    // Delete physical file
    await fs.unlink(file.path);

    // Update file record
    await file.update({
      status: 'deleted',
      deletedAt: new Date(),
      deletedBy: 'system',
      deletePolicy: policy.id
    });

    // Log the action
    await logFileAccess(file.id, 'system', 'delete', {
      policyId: policy.id
    });
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

// Request approval for retention action
const requestRetentionApproval = async (file, policy) => {
  try {
    // Create approval request
    const approvalRequest = await RetentionApproval.create({
      fileId: file.id,
      policyId: policy.id,
      status: 'pending',
      dueDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
    });

    // Notify approvers
    for (const approverId of policy.approvers) {
      const approver = await User.findByPk(approverId);
      if (approver && approver.email) {
        await sendEmail({
          to: approver.email,
          subject: `Retention Approval Required - ${file.fileNumber}`,
          template: 'retentionApproval',
          context: {
            approver: approver.name,
            file: file.fileNumber,
            action: policy.action,
            dueDate: approvalRequest.dueDate,
            approvalLink: `/retention-approval/${approvalRequest.id}`
          }
        });
      }
    }
  } catch (error) {
    throw new Error(`Failed to request retention approval: ${error.message}`);
  }
};

// Send notifications about retention action
const notifyRetentionAction = async (file, policy) => {
  try {
    const users = await User.findAll({
      where: {
        id: { [Op.in]: policy.notifyUsers }
      }
    });

    for (const user of users) {
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `File ${policy.action === 'archive' ? 'Archived' : 'Deleted'} - ${file.fileNumber}`,
          template: 'retentionNotification',
          context: {
            user: user.name,
            file: file.fileNumber,
            action: policy.action,
            policy: policy.name,
            date: new Date().toISOString()
          }
        });
      }
    }
  } catch (error) {
    console.error(`Failed to send retention notifications: ${error.message}`);
  }
};

// Check for upcoming retention dates and send warnings
const processRetentionWarnings = async () => {
  try {
    const activePolicies = await RetentionPolicy.findAll({
      where: { isActive: true }
    });

    for (const policy of activePolicies) {
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + policy.warningPeriod);

      const files = await File.findAll({
        where: {
          type: { [Op.in]: policy.fileTypes },
          ...(policy.department && { department: policy.department }),
          status: { [Op.notIn]: ['archived', 'deleted'] },
          retentionDate: {
            [Op.lte]: warningDate,
            [Op.gt]: new Date()
          },
          retentionWarningsSent: false
        }
      });

      for (const file of files) {
        await sendRetentionWarning(file, policy);
        await file.update({ retentionWarningsSent: true });
      }
    }
  } catch (error) {
    console.error('Error processing retention warnings:', error);
  }
};

// Send warning about upcoming retention
const sendRetentionWarning = async (file, policy) => {
  try {
    const users = await User.findAll({
      where: {
        id: { [Op.in]: [...policy.notifyUsers, file.createdBy, file.currentLocation] }
      }
    });

    for (const user of users) {
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `Retention Warning - ${file.fileNumber}`,
          template: 'retentionWarning',
          context: {
            user: user.name,
            file: file.fileNumber,
            action: policy.action,
            policy: policy.name,
            retentionDate: file.retentionDate,
            daysRemaining: Math.ceil((file.retentionDate - new Date()) / (1000 * 60 * 60 * 24))
          }
        });
      }
    }
  } catch (error) {
    console.error(`Failed to send retention warning: ${error.message}`);
  }
};

module.exports = {
  processRetention,
  processRetentionWarnings,
  requestRetentionApproval
};
