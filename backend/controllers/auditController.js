const AuditService = require('../services/auditService');
const createError = require('http-errors');

// Get audit logs with advanced filtering and pagination
const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
      userId,
      action,
      category,
      status,
      severity,
      resourceType,
      resourceId,
      searchTerm
    } = req.query;

    // Validate sort parameters
    const allowedSortFields = ['createdAt', 'action', 'category', 'status', 'severity'];
    if (!allowedSortFields.includes(sortBy)) {
      throw createError(400, 'Invalid sort field');
    }

    const filters = {
      userId,
      action,
      category,
      status,
      severity,
      resourceType,
      resourceId,
      startDate,
      endDate,
      searchTerm
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await AuditService.search(filters, pagination);

    res.json(result);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving audit logs'
    });
  }
};

// Get audit log details
const getAuditLogDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const audit = await AuditService.getResourceHistory('audit', id);
    if (!audit) {
      throw createError(404, 'Audit log not found');
    }

    res.json(audit);
  } catch (error) {
    console.error('Get audit details error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving audit details'
    });
  }
};

// Get audit statistics
const getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await AuditService.getStatistics({ startDate, endDate });
    res.json(stats);
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving audit statistics'
    });
  }
};

// Get user activity timeline
const getUserTimeline = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const timeline = await AuditService.getUserTimeline(userId, parseInt(limit));
    res.json(timeline);
  } catch (error) {
    console.error('Get user timeline error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving user timeline'
    });
  }
};

// Get resource audit history
const getResourceHistory = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;

    const history = await AuditService.getResourceHistory(resourceType, resourceId);
    res.json(history);
  } catch (error) {
    console.error('Get resource history error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error retrieving resource history'
    });
  }
};

// Clean up old audit logs (admin only)
const cleanupAuditLogs = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      throw createError(403, 'Only administrators can perform audit cleanup');
    }

    const { retentionDays = 365 } = req.body;
    if (retentionDays < 30) {
      throw createError(400, 'Minimum retention period is 30 days');
    }

    const deletedCount = await AuditService.cleanup(retentionDays);

    // Log the cleanup action
    await AuditService.log({
      userId: req.user.id,
      action: 'cleanup',
      category: 'system',
      status: 'success',
      severity: 'medium',
      metadata: {
        retentionDays,
        deletedCount
      }
    });

    res.json({
      message: `Successfully deleted ${deletedCount} audit logs`,
      deletedCount
    });
  } catch (error) {
    console.error('Audit cleanup error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error cleaning up audit logs'
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogDetails,
  getAuditStats,
  getUserTimeline,
  getResourceHistory,
  cleanupAuditLogs
};
