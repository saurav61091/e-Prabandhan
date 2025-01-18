const { Op } = require('sequelize');

class BaseService {
  constructor(model) {
    this.model = model;
  }

  // Create a new record
  async create(data, transaction = null) {
    try {
      return await this.model.create(data, { transaction });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Find one record by id
  async findById(id, options = {}) {
    try {
      return await this.model.findByPk(id, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Find one record by custom conditions
  async findOne(conditions = {}, options = {}) {
    try {
      return await this.model.findOne({ where: conditions, ...options });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Find all records matching conditions
  async findAll(conditions = {}, options = {}) {
    try {
      return await this.model.findAll({ where: conditions, ...options });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Find and paginate records
  async findAndPaginate(page = 1, limit = 10, conditions = {}, options = {}) {
    try {
      const offset = (page - 1) * limit;
      const { rows, count } = await this.model.findAndCountAll({
        where: conditions,
        limit,
        offset,
        ...options
      });

      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update a record by id
  async update(id, data, options = {}) {
    try {
      const [updatedCount] = await this.model.update(data, {
        where: { id },
        ...options
      });

      if (updatedCount === 0) {
        throw new Error('Record not found');
      }

      return this.findById(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete a record by id
  async delete(id, options = {}) {
    try {
      const deleted = await this.model.destroy({
        where: { id },
        ...options
      });

      if (!deleted) {
        throw new Error('Record not found');
      }

      return deleted;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bulk create records
  async bulkCreate(records, options = {}) {
    try {
      return await this.model.bulkCreate(records, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bulk update records
  async bulkUpdate(data, conditions = {}, options = {}) {
    try {
      const [updatedCount] = await this.model.update(data, {
        where: conditions,
        ...options
      });
      return updatedCount;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search records
  async search(query, fields = [], options = {}) {
    try {
      const searchConditions = fields.map(field => ({
        [field]: { [Op.like]: `%${query}%` }
      }));

      return await this.findAll({
        [Op.or]: searchConditions
      }, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle errors
  handleError(error) {
    // Log error here if needed
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      error.statusCode = 400;
      error.messages = messages;
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      error.statusCode = 409;
      error.message = 'Record already exists';
    }

    throw error;
  }
}

module.exports = BaseService;
