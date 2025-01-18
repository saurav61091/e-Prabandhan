const { Op } = require('sequelize');
const WorkflowPermission = require('../models/WorkflowPermission');
const WorkflowTemplate = require('../models/WorkflowTemplate');
const User = require('../models/User');

class WorkflowPermissionService {
  async createPermission(data) {
    try {
      return await WorkflowPermission.create(data);
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  async getTemplatePermissions(templateId) {
    return await WorkflowPermission.findAll({
      where: { templateId },
      order: [['priority', 'DESC']]
    });
  }

  async getUserPermissions(userId, templateId = null) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const where = {
      [Op.or]: [
        { entityType: 'user', entityId: userId },
        { entityType: 'role', entityId: user.role },
        { entityType: 'department', entityId: user.department }
      ]
    };

    if (templateId) {
      where.templateId = templateId;
    }

    return await WorkflowPermission.findAll({
      where,
      order: [['priority', 'DESC']]
    });
  }

  async checkPermission(userId, templateId, permission) {
    const permissions = await this.getUserPermissions(userId, templateId);
    
    // Check permissions in order of priority
    for (const perm of permissions) {
      if (perm.permissions[permission] !== undefined) {
        return perm.permissions[permission];
      }
    }

    return false;
  }

  async checkAnyPermission(userId, templateId, permissions) {
    const userPerms = await this.getUserPermissions(userId, templateId);
    
    for (const perm of userPerms) {
      if (permissions.some(p => perm.permissions[p] === true)) {
        return true;
      }
    }

    return false;
  }

  async checkAllPermissions(userId, templateId, permissions) {
    const userPerms = await this.getUserPermissions(userId, templateId);
    
    return permissions.every(permission => 
      userPerms.some(p => p.permissions[permission] === true)
    );
  }

  async updatePermission(id, data) {
    const permission = await WorkflowPermission.findByPk(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    return await permission.update(data);
  }

  async deletePermission(id) {
    const permission = await WorkflowPermission.findByPk(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    await permission.destroy();
  }

  async getEffectivePermissions(userId, templateId) {
    const permissions = await this.getUserPermissions(userId, templateId);
    const effectivePermissions = {};

    // Process permissions in order of priority
    permissions.forEach(permission => {
      Object.entries(permission.permissions).forEach(([key, value]) => {
        if (effectivePermissions[key] === undefined) {
          effectivePermissions[key] = value;
        }
      });
    });

    return effectivePermissions;
  }

  async copyTemplatePermissions(sourceTemplateId, targetTemplateId) {
    const permissions = await this.getTemplatePermissions(sourceTemplateId);
    
    for (const permission of permissions) {
      await this.createPermission({
        ...permission.toJSON(),
        id: undefined,
        templateId: targetTemplateId
      });
    }
  }

  async addUserPermission(templateId, userId, permissions, priority = 0) {
    return await this.createPermission({
      templateId,
      entityType: 'user',
      entityId: userId,
      permissions,
      priority
    });
  }

  async addRolePermission(templateId, role, permissions, priority = 0) {
    return await this.createPermission({
      templateId,
      entityType: 'role',
      entityId: role,
      permissions,
      priority
    });
  }

  async addDepartmentPermission(templateId, department, permissions, priority = 0) {
    return await this.createPermission({
      templateId,
      entityType: 'department',
      entityId: department,
      permissions,
      priority
    });
  }

  async getPermissionsByEntity(entityType, entityId) {
    return await WorkflowPermission.findAll({
      where: { entityType, entityId },
      include: [{
        model: WorkflowTemplate,
        as: 'template'
      }]
    });
  }

  async checkConditions(permission, context) {
    if (!permission.conditions) return true;

    const {
      fileTypes,
      departments,
      metadata,
      custom
    } = permission.conditions;

    // Check file types
    if (fileTypes && context.fileType) {
      if (!fileTypes.includes(context.fileType)) {
        return false;
      }
    }

    // Check departments
    if (departments && context.department) {
      if (!departments.includes(context.department)) {
        return false;
      }
    }

    // Check metadata conditions
    if (metadata && context.metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        if (context.metadata[key] !== value) {
          return false;
        }
      }
    }

    // Check custom conditions
    if (custom) {
      // Implement custom condition checking logic here
      // This could involve calling external services or complex business logic
    }

    return true;
  }

  getDefaultPermissions(role) {
    const defaults = {
      admin: {
        view: true,
        edit: true,
        delete: true,
        manage: true,
        start: true,
        assign: true,
        reassign: true,
        cancel: true,
        viewMetrics: true,
        exportData: true
      },
      supervisor: {
        view: true,
        edit: false,
        delete: false,
        manage: false,
        start: true,
        assign: true,
        reassign: true,
        cancel: true,
        viewMetrics: true,
        exportData: true
      },
      user: {
        view: true,
        edit: false,
        delete: false,
        manage: false,
        start: true,
        assign: false,
        reassign: false,
        cancel: false,
        viewMetrics: false,
        exportData: false
      }
    };

    return defaults[role] || defaults.user;
  }
}

module.exports = new WorkflowPermissionService();
