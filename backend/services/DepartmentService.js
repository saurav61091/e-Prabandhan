const BaseService = require('./BaseService');
const { Department, User, Designation } = require('../models');
const { generateUniqueCode } = require('../utils/codeGenerator');

class DepartmentService extends BaseService {
  constructor() {
    super(Department);
  }

  // Create department with unique code
  async create(data) {
    const code = await generateUniqueCode('DEPT', async (code) => {
      const exists = await this.findOne({ code });
      return !exists;
    });

    return super.create({
      ...data,
      code
    });
  }

  // Get department hierarchy
  async getHierarchy(departmentId) {
    const department = await this.findOne(
      { id: departmentId },
      {
        include: [
          {
            model: Department,
            as: 'childDepartments',
            include: [
              {
                model: User,
                as: 'head',
                attributes: ['id', 'username', 'email']
              }
            ]
          },
          {
            model: User,
            as: 'head',
            attributes: ['id', 'username', 'email']
          }
        ]
      }
    );

    if (!department) {
      throw new Error('Department not found');
    }

    return this.formatHierarchy(department);
  }

  // Format hierarchy data
  formatHierarchy(department) {
    const { childDepartments, ...dept } = department.toJSON();
    return {
      ...dept,
      children: childDepartments ? childDepartments.map(child => this.formatHierarchy(child)) : []
    };
  }

  // Get department with staff details
  async getDepartmentStaff(departmentId) {
    return this.findOne(
      { id: departmentId },
      {
        include: [
          {
            model: User,
            as: 'staff',
            include: [
              {
                model: Designation,
                as: 'designation'
              }
            ]
          }
        ]
      }
    );
  }

  // Update department head
  async updateHead(departmentId, headUserId) {
    const department = await this.findById(departmentId);
    const user = await User.findByPk(headUserId);

    if (!department || !user) {
      throw new Error('Department or User not found');
    }

    if (user.departmentId !== departmentId) {
      throw new Error('User must belong to the department');
    }

    return this.update(departmentId, { headUserId });
  }

  // Get department statistics
  async getStatistics(departmentId) {
    const department = await this.findById(departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    const [staffCount, designationCount, childDepartmentsCount] = await Promise.all([
      User.count({ where: { departmentId } }),
      Designation.count({ where: { departmentId } }),
      Department.count({ where: { parentId: departmentId } })
    ]);

    return {
      staffCount,
      designationCount,
      childDepartmentsCount
    };
  }

  // Transfer staff to another department
  async transferStaff(userId, fromDepartmentId, toDepartmentId) {
    const user = await User.findByPk(userId);
    if (!user || user.departmentId !== fromDepartmentId) {
      throw new Error('User not found or does not belong to source department');
    }

    const toDepartment = await this.findById(toDepartmentId);
    if (!toDepartment) {
      throw new Error('Target department not found');
    }

    // Reset designation if it belongs to old department
    const designation = await Designation.findByPk(user.designationId);
    const designationUpdate = designation && designation.departmentId === fromDepartmentId
      ? { designationId: null }
      : {};

    await user.update({
      departmentId: toDepartmentId,
      ...designationUpdate
    });

    return user;
  }

  // Merge departments
  async mergeDepartments(sourceDepartmentId, targetDepartmentId) {
    const [sourceDept, targetDept] = await Promise.all([
      this.findById(sourceDepartmentId),
      this.findById(targetDepartmentId)
    ]);

    if (!sourceDept || !targetDept) {
      throw new Error('One or both departments not found');
    }

    // Update all references from source to target
    await Promise.all([
      User.update(
        { departmentId: targetDepartmentId },
        { where: { departmentId: sourceDepartmentId } }
      ),
      Department.update(
        { parentId: targetDepartmentId },
        { where: { parentId: sourceDepartmentId } }
      ),
      Designation.update(
        { departmentId: targetDepartmentId },
        { where: { departmentId: sourceDepartmentId } }
      )
    ]);

    // Delete source department
    await this.delete(sourceDepartmentId);

    return targetDept;
  }
}

module.exports = DepartmentService;
