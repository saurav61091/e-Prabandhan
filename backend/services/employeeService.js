const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const { Op } = require('sequelize');
const createError = require('http-errors');
const { generatePassword } = require('../utils/auth');
const emailService = require('./emailService');
const notificationService = require('./notificationService');
const auditService = require('./auditService');

class EmployeeService {
  /**
   * Create a new employee
   * @param {Object} employeeData Employee data
   * @param {string} createdBy User ID who created the employee
   * @returns {Promise<Employee>} Created employee
   */
  static async createEmployee(employeeData, createdBy) {
    try {
      // Generate credentials for user account
      const password = generatePassword();
      const { email, firstName, lastName } = employeeData;

      // Create user account
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: employeeData.role || 'employee',
        createdBy
      });

      // Create employee record
      const employee = await Employee.create({
        ...employeeData,
        userId: user.id,
        workEmail: email
      });

      // Send welcome email with credentials
      await emailService.sendWelcomeEmail(email, {
        firstName,
        password,
        employeeId: employee.employeeId
      });

      // Send notification to department manager
      const department = await Department.findByPk(employee.departmentId);
      if (department && department.managerId) {
        await notificationService.createNotification({
          userId: department.managerId,
          type: 'new_employee',
          title: 'New Employee Joined',
          message: `${firstName} ${lastName} has joined ${department.name} department`,
          priority: 'medium',
          metadata: {
            employeeId: employee.id,
            departmentId: department.id
          }
        });
      }

      // Log the activity
      await auditService.logActivity({
        userId: createdBy,
        action: 'EMPLOYEE_CREATED',
        resourceType: 'employee',
        resourceId: employee.id,
        metadata: {
          employeeId: employee.employeeId,
          department: department.name
        }
      });

      return employee;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  }

  /**
   * Update employee details
   * @param {string} employeeId Employee ID
   * @param {Object} updates Update data
   * @param {string} updatedBy User ID who updated the employee
   * @returns {Promise<Employee>} Updated employee
   */
  static async updateEmployee(employeeId, updates, updatedBy) {
    try {
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw createError(404, 'Employee not found');
      }

      // Track changes for audit
      const changes = {};
      Object.keys(updates).forEach(key => {
        if (employee[key] !== updates[key]) {
          changes[key] = {
            from: employee[key],
            to: updates[key]
          };
        }
      });

      // Update employee
      await employee.update(updates);

      // If department changed, notify new manager
      if (updates.departmentId && updates.departmentId !== employee.departmentId) {
        const newDepartment = await Department.findByPk(updates.departmentId);
        if (newDepartment && newDepartment.managerId) {
          await notificationService.createNotification({
            userId: newDepartment.managerId,
            type: 'employee_department_change',
            title: 'New Employee in Department',
            message: `${employee.user.firstName} ${employee.user.lastName} has been moved to your department`,
            priority: 'medium',
            metadata: {
              employeeId: employee.id,
              departmentId: newDepartment.id
            }
          });
        }
      }

      // Log the activity
      await auditService.logActivity({
        userId: updatedBy,
        action: 'EMPLOYEE_UPDATED',
        resourceType: 'employee',
        resourceId: employee.id,
        metadata: {
          employeeId: employee.employeeId,
          changes
        }
      });

      return employee;
    } catch (error) {
      console.error('Update employee error:', error);
      throw error;
    }
  }

  /**
   * Get employee details
   * @param {string} employeeId Employee ID
   * @returns {Promise<Employee>} Employee details
   */
  static async getEmployee(employeeId) {
    try {
      const employee = await Employee.findByPk(employeeId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: Department,
            as: 'department'
          },
          {
            model: Employee,
            as: 'manager',
            include: [{
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }]
          }
        ]
      });

      if (!employee) {
        throw createError(404, 'Employee not found');
      }

      return employee;
    } catch (error) {
      console.error('Get employee error:', error);
      throw error;
    }
  }

  /**
   * Search employees
   * @param {Object} params Search parameters
   * @returns {Promise<Object>} Search results with pagination
   */
  static async searchEmployees({
    query,
    departmentId,
    status,
    type,
    page = 1,
    limit = 20,
    sortBy = 'joinDate',
    sortOrder = 'DESC'
  }) {
    try {
      const where = {};

      // Add filters
      if (query) {
        where[Op.or] = [
          { employeeId: { [Op.like]: `%${query}%` } },
          { '$user.firstName$': { [Op.iLike]: `%${query}%` } },
          { '$user.lastName$': { [Op.iLike]: `%${query}%` } },
          { '$user.email$': { [Op.iLike]: `%${query}%` } }
        ];
      }

      if (departmentId) where.departmentId = departmentId;
      if (status) where.status = status;
      if (type) where.type = type;

      // Get employees with pagination
      const { rows: employees, count } = await Employee.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: Department,
            as: 'department'
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      return {
        employees,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Search employees error:', error);
      throw error;
    }
  }

  /**
   * Get employee reporting structure
   * @param {string} employeeId Employee ID
   * @returns {Promise<Object>} Reporting structure
   */
  static async getReportingStructure(employeeId) {
    try {
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw createError(404, 'Employee not found');
      }

      const [reportingChain, subordinates] = await Promise.all([
        employee.getReportingChain(),
        employee.getSubordinates(3) // Get subordinates up to 3 levels deep
      ]);

      return {
        employee,
        reportingChain,
        subordinates
      };
    } catch (error) {
      console.error('Get reporting structure error:', error);
      throw error;
    }
  }

  /**
   * Get employee statistics
   * @param {string} departmentId Optional department ID for filtering
   * @returns {Promise<Object>} Employee statistics
   */
  static async getEmployeeStats(departmentId = null) {
    try {
      const where = departmentId ? { departmentId } : {};

      const [
        totalCount,
        statusCounts,
        typeCounts,
        departmentCounts,
        joinDateStats
      ] = await Promise.all([
        Employee.count({ where }),
        Employee.count({
          where,
          group: ['status']
        }),
        Employee.count({
          where,
          group: ['type']
        }),
        Employee.count({
          where,
          group: ['departmentId'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['name']
          }]
        }),
        Employee.findAll({
          where,
          attributes: [
            [sequelize.fn('date_trunc', 'month', sequelize.col('joinDate')), 'month'],
            [sequelize.fn('count', '*'), 'count']
          ],
          group: [sequelize.fn('date_trunc', 'month', sequelize.col('joinDate'))],
          order: [[sequelize.fn('date_trunc', 'month', sequelize.col('joinDate')), 'DESC']],
          limit: 12
        })
      ]);

      return {
        totalEmployees: totalCount,
        byStatus: statusCounts,
        byType: typeCounts,
        byDepartment: departmentCounts,
        joinTrends: joinDateStats
      };
    } catch (error) {
      console.error('Get employee stats error:', error);
      throw error;
    }
  }
}

module.exports = EmployeeService;
