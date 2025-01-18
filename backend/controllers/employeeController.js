const EmployeeService = require('../services/employeeService');
const { validateSchema } = require('../utils/validation');
const { employeeSchema } = require('../validation/employeeSchema');
const createError = require('http-errors');

/**
 * Create a new employee
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const createEmployee = async (req, res) => {
  try {
    // Validate request body
    await validateSchema(employeeSchema.create, req.body);

    // Create employee
    const employee = await EmployeeService.createEmployee(req.body, req.user.id);

    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error creating employee'
    });
  }
};

/**
 * Update employee details
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Validate request body
    await validateSchema(employeeSchema.update, req.body);

    // Update employee
    const employee = await EmployeeService.updateEmployee(
      employeeId,
      req.body,
      req.user.id
    );

    res.json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error updating employee'
    });
  }
};

/**
 * Get employee details
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get employee details
    const employee = await EmployeeService.getEmployee(employeeId);

    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error getting employee details'
    });
  }
};

/**
 * Search employees
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const searchEmployees = async (req, res) => {
  try {
    // Validate query parameters
    await validateSchema(employeeSchema.search, req.query);

    // Search employees
    const results = await EmployeeService.searchEmployees(req.query);

    res.json(results);
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error searching employees'
    });
  }
};

/**
 * Get employee reporting structure
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getReportingStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get reporting structure
    const structure = await EmployeeService.getReportingStructure(employeeId);

    res.json(structure);
  } catch (error) {
    console.error('Get reporting structure error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error getting reporting structure'
    });
  }
};

/**
 * Get employee statistics
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getEmployeeStats = async (req, res) => {
  try {
    const { departmentId } = req.query;

    // Get employee statistics
    const stats = await EmployeeService.getEmployeeStats(departmentId);

    res.json(stats);
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error getting employee statistics'
    });
  }
};

/**
 * Upload employee document
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const uploadDocument = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      throw createError(400, 'No file uploaded');
    }

    // Validate document type
    await validateSchema(employeeSchema.document, { documentType });

    // Update employee documents
    const employee = await EmployeeService.updateEmployee(
      employeeId,
      {
        documents: {
          ...employee.documents,
          [documentType]: {
            path: file.path,
            uploadedAt: new Date(),
            uploadedBy: req.user.id
          }
        }
      },
      req.user.id
    );

    res.json({
      message: 'Document uploaded successfully',
      document: employee.documents[documentType]
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error uploading document'
    });
  }
};

/**
 * Get employee documents
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get employee details
    const employee = await EmployeeService.getEmployee(employeeId);

    res.json(employee.documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error getting employee documents'
    });
  }
};

module.exports = {
  createEmployee,
  updateEmployee,
  getEmployee,
  searchEmployees,
  getReportingStructure,
  getEmployeeStats,
  uploadDocument,
  getDocuments
};
