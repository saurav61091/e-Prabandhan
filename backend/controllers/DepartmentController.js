const BaseController = require('./BaseController');
const DepartmentService = require('../services/DepartmentService');

class DepartmentController extends BaseController {
  constructor() {
    super(new DepartmentService());
  }

  // Create department
  create = this.handleAsync(async (req, res) => {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const department = await this.service.create(req.body);
    res.status(201).json({
      success: true,
      data: department
    });
  });

  // Get department hierarchy
  getHierarchy = this.handleAsync(async (req, res) => {
    const { id } = req.params;
    const hierarchy = await this.service.getHierarchy(id);
    res.json({
      success: true,
      data: hierarchy
    });
  });

  // Get department staff
  getDepartmentStaff = this.handleAsync(async (req, res) => {
    const { id } = req.params;
    const departmentStaff = await this.service.getDepartmentStaff(id);
    res.json({
      success: true,
      data: departmentStaff
    });
  });

  // Update department head
  updateHead = this.handleAsync(async (req, res) => {
    const { id } = req.params;
    const { headUserId } = req.body;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const department = await this.service.updateHead(id, headUserId);
    res.json({
      success: true,
      data: department
    });
  });

  // Get department statistics
  getStatistics = this.handleAsync(async (req, res) => {
    const { id } = req.params;
    const statistics = await this.service.getStatistics(id);
    res.json({
      success: true,
      data: statistics
    });
  });

  // Transfer staff
  transferStaff = this.handleAsync(async (req, res) => {
    const { userId, fromDepartmentId, toDepartmentId } = req.body;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const user = await this.service.transferStaff(
      userId,
      fromDepartmentId,
      toDepartmentId
    );

    res.json({
      success: true,
      data: user
    });
  });

  // Merge departments
  mergeDepartments = this.handleAsync(async (req, res) => {
    const { sourceDepartmentId, targetDepartmentId } = req.body;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const result = await this.service.mergeDepartments(
      sourceDepartmentId,
      targetDepartmentId
    );

    res.json({
      success: true,
      data: result
    });
  });
}

module.exports = DepartmentController;
