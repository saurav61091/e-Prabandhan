const Organization = require('../models/Organization');
const Employee = require('../models/Employee');
const createError = require('http-errors');
const { Op } = require('sequelize');
const auditService = require('./auditService');
const notificationService = require('./notificationService');

class OrganizationService {
  /**
   * Create a new organization unit
   * @param {Object} orgData Organization data
   * @param {string} createdBy User ID who created the organization
   * @returns {Promise<Organization>} Created organization
   */
  static async createOrganization(orgData, createdBy) {
    try {
      const organization = await Organization.create(orgData);

      // If manager is assigned, update employee record
      if (orgData.managerId) {
        await Employee.update(
          { organizationId: organization.id },
          { where: { id: orgData.managerId } }
        );

        // Notify the assigned manager
        await notificationService.createNotification({
          userId: orgData.managerId,
          type: 'org_manager_assigned',
          title: 'Organization Management',
          message: `You have been assigned as manager of ${organization.name}`,
          priority: 'high',
          metadata: {
            organizationId: organization.id,
            organizationType: organization.type
          }
        });
      }

      // Log the activity
      await auditService.logActivity({
        userId: createdBy,
        action: 'ORGANIZATION_CREATED',
        resourceType: 'organization',
        resourceId: organization.id,
        metadata: {
          name: organization.name,
          type: organization.type,
          code: organization.code
        }
      });

      return organization;
    } catch (error) {
      console.error('Create organization error:', error);
      throw error;
    }
  }

  /**
   * Update organization details
   * @param {string} orgId Organization ID
   * @param {Object} updates Update data
   * @param {string} updatedBy User ID who updated the organization
   * @returns {Promise<Organization>} Updated organization
   */
  static async updateOrganization(orgId, updates, updatedBy) {
    try {
      const organization = await Organization.findByPk(orgId);
      if (!organization) {
        throw createError(404, 'Organization not found');
      }

      // Track changes for audit
      const changes = {};
      Object.keys(updates).forEach(key => {
        if (organization[key] !== updates[key]) {
          changes[key] = {
            from: organization[key],
            to: updates[key]
          };
        }
      });

      // If manager is being changed
      if (updates.managerId && updates.managerId !== organization.managerId) {
        // Update old manager's record
        if (organization.managerId) {
          await Employee.update(
            { organizationId: null },
            { where: { id: organization.managerId } }
          );
        }

        // Update new manager's record
        await Employee.update(
          { organizationId: organization.id },
          { where: { id: updates.managerId } }
        );

        // Notify new manager
        await notificationService.createNotification({
          userId: updates.managerId,
          type: 'org_manager_assigned',
          title: 'Organization Management',
          message: `You have been assigned as manager of ${organization.name}`,
          priority: 'high',
          metadata: {
            organizationId: organization.id,
            organizationType: organization.type
          }
        });
      }

      // Update organization
      await organization.update(updates);

      // Update headcount if structure changed
      if (updates.parentId) {
        await organization.updateHeadcount();
      }

      // Log the activity
      await auditService.logActivity({
        userId: updatedBy,
        action: 'ORGANIZATION_UPDATED',
        resourceType: 'organization',
        resourceId: organization.id,
        metadata: {
          name: organization.name,
          changes
        }
      });

      return organization;
    } catch (error) {
      console.error('Update organization error:', error);
      throw error;
    }
  }

  /**
   * Get organization details
   * @param {string} orgId Organization ID
   * @returns {Promise<Organization>} Organization details
   */
  static async getOrganization(orgId) {
    try {
      const organization = await Organization.findByPk(orgId, {
        include: [
          {
            model: Employee,
            as: 'manager',
            attributes: ['id', 'employeeId', 'position']
          },
          {
            model: Organization,
            as: 'parent',
            attributes: ['id', 'name', 'code', 'type']
          }
        ]
      });

      if (!organization) {
        throw createError(404, 'Organization not found');
      }

      return organization;
    } catch (error) {
      console.error('Get organization error:', error);
      throw error;
    }
  }

  /**
   * Get organization hierarchy
   * @param {string} orgId Organization ID
   * @param {number} depth Depth of hierarchy to retrieve
   * @returns {Promise<Object>} Organization hierarchy
   */
  static async getHierarchy(orgId, depth = null) {
    try {
      const organization = await Organization.findByPk(orgId);
      if (!organization) {
        throw createError(404, 'Organization not found');
      }

      return organization.getHierarchy(depth);
    } catch (error) {
      console.error('Get hierarchy error:', error);
      throw error;
    }
  }

  /**
   * Search organizations
   * @param {Object} params Search parameters
   * @returns {Promise<Object>} Search results
   */
  static async searchOrganizations({
    query,
    type,
    status,
    parentId,
    page = 1,
    limit = 20,
    sortBy = 'name',
    sortOrder = 'ASC'
  }) {
    try {
      const where = {};

      if (query) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${query}%` } },
          { code: { [Op.iLike]: `%${query}%` } }
        ];
      }

      if (type) where.type = type;
      if (status) where.status = status;
      if (parentId) where.parentId = parentId;

      const { rows: organizations, count } = await Organization.findAndCountAll({
        where,
        include: [
          {
            model: Employee,
            as: 'manager',
            attributes: ['id', 'employeeId', 'position']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      return {
        organizations,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Search organizations error:', error);
      throw error;
    }
  }

  /**
   * Get organization statistics
   * @returns {Promise<Object>} Organization statistics
   */
  static async getStatistics() {
    try {
      const [
        totalCount,
        typeCounts,
        statusCounts,
        levelCounts,
        headcountStats
      ] = await Promise.all([
        Organization.count(),
        Organization.count({ group: ['type'] }),
        Organization.count({ group: ['status'] }),
        Organization.count({ group: ['level'] }),
        Organization.findAll({
          attributes: [
            'type',
            [sequelize.fn('SUM', sequelize.col('headcount')), 'total_headcount'],
            [sequelize.fn('AVG', sequelize.col('headcount')), 'avg_headcount']
          ],
          group: ['type']
        })
      ]);

      return {
        totalOrganizations: totalCount,
        byType: typeCounts,
        byStatus: statusCounts,
        byLevel: levelCounts,
        headcountStats
      };
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  /**
   * Move organization to new parent
   * @param {string} orgId Organization ID
   * @param {string} newParentId New parent organization ID
   * @param {string} movedBy User ID who moved the organization
   * @returns {Promise<Organization>} Updated organization
   */
  static async moveOrganization(orgId, newParentId, movedBy) {
    try {
      const [organization, newParent] = await Promise.all([
        Organization.findByPk(orgId),
        Organization.findByPk(newParentId)
      ]);

      if (!organization) {
        throw createError(404, 'Organization not found');
      }

      if (!newParent) {
        throw createError(404, 'New parent organization not found');
      }

      // Check for circular reference
      const newParentPath = await newParent.getFullPath();
      if (newParentPath.some(org => org.id === orgId)) {
        throw createError(400, 'Cannot move organization to its own descendant');
      }

      const oldParentId = organization.parentId;

      // Update organization
      await organization.update({
        parentId: newParentId,
        level: newParent.level + 1,
        path: `${newParent.path}.${organization.id}`
      });

      // Update headcounts
      await Promise.all([
        organization.updateHeadcount(),
        oldParentId && Organization.findByPk(oldParentId).then(oldParent => 
          oldParent && oldParent.updateHeadcount()
        )
      ]);

      // Log the activity
      await auditService.logActivity({
        userId: movedBy,
        action: 'ORGANIZATION_MOVED',
        resourceType: 'organization',
        resourceId: organization.id,
        metadata: {
          name: organization.name,
          fromParentId: oldParentId,
          toParentId: newParentId
        }
      });

      return organization;
    } catch (error) {
      console.error('Move organization error:', error);
      throw error;
    }
  }
}

module.exports = OrganizationService;
