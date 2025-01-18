const Audit = require('../models/Audit');
const { Op } = require('sequelize');

class AuditService {
  // Log an audit event
  static async log(data) {
    try {
      const {
        userId,
        action,
        category,
        status,
        ipAddress,
        userAgent,
        resourceId,
        resourceType,
        oldValues,
        newValues,
        metadata,
        severity,
        sessionId
      } = data;

      // Create audit entry
      const audit = await Audit.create({
        userId,
        action,
        category,
        status,
        ipAddress,
        userAgent,
        resourceId,
        resourceType,
        oldValues,
        newValues,
        metadata,
        severity,
        sessionId
      });

      // If this is a high severity event, trigger alerts
      if (['high', 'critical'].includes(severity)) {
        await this.triggerAlerts(audit);
      }

      return audit;
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw error to prevent disrupting main operation
    }
  }

  // Search audit logs with filters
  static async search(filters, pagination) {
    try {
      const {
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
      } = filters;

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;

      const where = {};

      // Apply filters
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (category) where.category = category;
      if (status) where.status = status;
      if (severity) where.severity = severity;
      if (resourceType) where.resourceType = resourceType;
      if (resourceId) where.resourceId = resourceId;

      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      // Search term
      if (searchTerm) {
        where[Op.or] = [
          { action: { [Op.like]: `%${searchTerm}%` } },
          { metadata: { [Op.like]: `%${searchTerm}%` } }
        ];
      }

      // Execute query
      const { rows: audits, count } = await Audit.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset: (page - 1) * limit
      });

      return {
        audits,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Audit search error:', error);
      throw error;
    }
  }

  // Get audit statistics
  static async getStatistics(filters = {}) {
    try {
      const { startDate, endDate } = filters;

      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const [
        totalEvents,
        severityStats,
        categoryStats,
        statusStats
      ] = await Promise.all([
        Audit.count({ where }),
        Audit.count({
          where,
          group: ['severity']
        }),
        Audit.count({
          where,
          group: ['category']
        }),
        Audit.count({
          where,
          group: ['status']
        })
      ]);

      return {
        totalEvents,
        severityStats,
        categoryStats,
        statusStats
      };
    } catch (error) {
      console.error('Audit statistics error:', error);
      throw error;
    }
  }

  // Get user activity timeline
  static async getUserTimeline(userId, limit = 10) {
    try {
      const audits = await Audit.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit
      });

      return audits;
    } catch (error) {
      console.error('User timeline error:', error);
      throw error;
    }
  }

  // Get resource history
  static async getResourceHistory(resourceType, resourceId) {
    try {
      const audits = await Audit.findAll({
        where: {
          resourceType,
          resourceId
        },
        order: [['createdAt', 'DESC']]
      });

      return audits;
    } catch (error) {
      console.error('Resource history error:', error);
      throw error;
    }
  }

  // Trigger alerts for high severity events
  static async triggerAlerts(audit) {
    try {
      // Implement alert mechanisms here (email, SMS, webhook, etc.)
      console.log('High severity audit event:', audit.toJSON());
    } catch (error) {
      console.error('Alert trigger error:', error);
    }
  }

  // Clean up old audit logs
  static async cleanup(retentionDays = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deletedCount = await Audit.destroy({
        where: {
          createdAt: {
            [Op.lt]: cutoffDate
          },
          severity: {
            [Op.notIn]: ['high', 'critical'] // Keep high severity events
          }
        }
      });

      return deletedCount;
    } catch (error) {
      console.error('Audit cleanup error:', error);
      throw error;
    }
  }
}

module.exports = AuditService;
