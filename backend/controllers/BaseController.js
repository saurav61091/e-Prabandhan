const { ValidationError } = require('sequelize');

class BaseController {
  constructor(service) {
    this.service = service;
  }

  // Wrap the controller method with error handling
  handleAsync(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(this.handleError(error));
      }
    };
  }

  // Create a new record
  create = this.handleAsync(async (req, res) => {
    const data = await this.service.create(req.body);
    res.status(201).json({
      success: true,
      data
    });
  });

  // Get a record by id
  getById = this.handleAsync(async (req, res) => {
    const data = await this.service.findById(req.params.id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    res.json({
      success: true,
      data
    });
  });

  // Get all records with pagination
  getAll = this.handleAsync(async (req, res) => {
    const { page = 1, limit = 10, ...query } = req.query;
    const result = await this.service.findAndPaginate(page, limit, query);
    res.json({
      success: true,
      ...result
    });
  });

  // Update a record
  update = this.handleAsync(async (req, res) => {
    const data = await this.service.update(req.params.id, req.body);
    res.json({
      success: true,
      data
    });
  });

  // Delete a record
  delete = this.handleAsync(async (req, res) => {
    await this.service.delete(req.params.id);
    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  });

  // Search records
  search = this.handleAsync(async (req, res) => {
    const { query, fields } = req.query;
    const data = await this.service.search(query, fields.split(','));
    res.json({
      success: true,
      data
    });
  });

  // Handle errors
  handleError(error) {
    if (error instanceof ValidationError) {
      return {
        status: 400,
        message: 'Validation Error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      };
    }

    // Handle other types of errors
    return {
      status: error.statusCode || 500,
      message: error.message || 'Internal Server Error',
      errors: error.errors || null
    };
  }
}

module.exports = BaseController;
