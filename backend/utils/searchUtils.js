const createError = require('http-errors');

/**
 * Sanitize search query to prevent injection
 * @param {string} query Raw search query
 * @returns {string} Sanitized query
 */
const sanitizeQuery = (query) => {
  if (!query) return '';
  
  // Remove Elasticsearch special characters
  return query.replace(/[+\-=&|><!(){}[\]^"~*?:\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Build Elasticsearch query from search parameters
 * @param {Object} params Search parameters
 * @returns {Object} Elasticsearch query
 */
const buildElasticQuery = ({ query, filters }) => {
  const must = [];
  const filter = [];

  // Add full-text search if query exists
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: [
          'name^3',
          'content^2',
          'metadata.*',
          'tags',
          'comments.text'
        ],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  // Add date range filter
  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    filter.push({
      range: {
        createdAt: {
          ...(start && { gte: start }),
          ...(end && { lte: end })
        }
      }
    });
  }

  // Add file type filter
  if (filters.fileTypes && filters.fileTypes.length > 0) {
    filter.push({
      terms: {
        fileType: filters.fileTypes
      }
    });
  }

  // Add tags filter
  if (filters.tags && filters.tags.length > 0) {
    filter.push({
      terms: {
        tags: filters.tags
      }
    });
  }

  // Add size filter
  if (filters.size) {
    const { min, max } = filters.size;
    filter.push({
      range: {
        size: {
          ...(min && { gte: min }),
          ...(max && { lte: max })
        }
      }
    });
  }

  // Add creator filter
  if (filters.creator) {
    filter.push({
      term: {
        createdBy: filters.creator
      }
    });
  }

  // Add last modified filter
  if (filters.lastModified) {
    filter.push({
      range: {
        updatedAt: {
          gte: filters.lastModified
        }
      }
    });
  }

  // Add status filter
  if (filters.status) {
    filter.push({
      term: {
        status: filters.status
      }
    });
  }

  // Add metadata filters
  if (filters.metadata && Object.keys(filters.metadata).length > 0) {
    Object.entries(filters.metadata).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        filter.push({
          terms: {
            [`metadata.${field}`]: value
          }
        });
      } else if (typeof value === 'object') {
        // Handle range queries for numeric metadata
        const { min, max } = value;
        filter.push({
          range: {
            [`metadata.${field}`]: {
              ...(min && { gte: min }),
              ...(max && { lte: max })
            }
          }
        });
      } else {
        filter.push({
          term: {
            [`metadata.${field}`]: value
          }
        });
      }
    });
  }

  return {
    bool: {
      must,
      filter
    }
  };
};

/**
 * Parse sort parameters
 * @param {string} sortString Sort string (e.g., "field:order")
 * @returns {Object} Parsed sort parameters
 */
const parseSortParams = (sortString) => {
  if (!sortString) {
    return {};
  }

  const [field, order] = sortString.split(':');
  if (!field) {
    return {};
  }

  const validOrders = ['asc', 'desc'];
  return {
    field,
    order: validOrders.includes(order) ? order : 'desc'
  };
};

/**
 * Parse metadata filter string
 * @param {string} filterString Metadata filter string
 * @returns {Object} Parsed metadata filters
 */
const parseMetadataFilters = (filterString) => {
  if (!filterString) {
    return {};
  }

  try {
    const filters = {};
    const pairs = filterString.split(',');

    pairs.forEach(pair => {
      const [key, value] = pair.split(':');
      if (!key || !value) return;

      // Handle array values
      if (value.startsWith('[') && value.endsWith(']')) {
        filters[key] = value.slice(1, -1).split('|');
        return;
      }

      // Handle range values
      if (value.startsWith('(') && value.endsWith(')')) {
        const [min, max] = value.slice(1, -1).split('|');
        filters[key] = {
          min: min !== '' ? parseFloat(min) : undefined,
          max: max !== '' ? parseFloat(max) : undefined
        };
        return;
      }

      // Handle simple values
      filters[key] = value;
    });

    return filters;
  } catch (error) {
    throw createError(400, 'Invalid metadata filter format');
  }
};

module.exports = {
  sanitizeQuery,
  buildElasticQuery,
  parseSortParams,
  parseMetadataFilters
};
