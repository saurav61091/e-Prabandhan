const SearchService = require('../services/searchService');
const { validateSchema } = require('../utils/validation');
const { searchSchema } = require('../validation/searchSchema');
const { parseSortParams, parseMetadataFilters } = require('../utils/searchUtils');
const createError = require('http-errors');

/**
 * Search files with advanced filters
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const searchFiles = async (req, res) => {
  try {
    const {
      q: query,
      type: fileTypes,
      tags,
      from: startDate,
      to: endDate,
      creator,
      modified: lastModified,
      status,
      metadata: metadataFilters,
      sort: sortString,
      page = 1,
      limit = 20
    } = req.query;

    // Validate search parameters
    await validateSchema(searchSchema.search, {
      query,
      fileTypes,
      tags,
      startDate,
      endDate,
      creator,
      lastModified,
      status,
      metadataFilters,
      sortString,
      page,
      limit
    });

    // Parse sort and metadata parameters
    const sort = parseSortParams(sortString);
    const metadata = parseMetadataFilters(metadataFilters);

    // Perform search
    const results = await SearchService.searchFiles({
      query,
      filters: {
        fileTypes: fileTypes ? fileTypes.split(',') : undefined,
        tags: tags ? tags.split(',') : undefined,
        dateRange: {
          start: startDate,
          end: endDate
        },
        creator,
        lastModified,
        status,
        metadata
      },
      sort,
      page: parseInt(page),
      limit: parseInt(limit),
      userId: req.user.id,
      departmentId: req.user.departmentId
    });

    res.json(results);
  } catch (error) {
    console.error('Search files error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error performing search'
    });
  }
};

/**
 * Search metadata fields
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const searchMetadata = async (req, res) => {
  try {
    const { field, value, type = 'prefix', limit = 10 } = req.query;

    // Validate parameters
    await validateSchema(searchSchema.metadataSearch, {
      field,
      value,
      type,
      limit
    });

    // Search metadata
    const results = await SearchService.searchMetadata({
      field,
      value,
      type,
      limit: parseInt(limit)
    });

    res.json(results);
  } catch (error) {
    console.error('Search metadata error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error searching metadata'
    });
  }
};

/**
 * Reindex all files (admin only)
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const reindexFiles = async (req, res) => {
  try {
    if (!req.user.role.includes('admin')) {
      throw createError(403, 'Only administrators can reindex files');
    }

    await SearchService.reindexFiles();

    res.json({
      message: 'Files reindexed successfully'
    });
  } catch (error) {
    console.error('Reindex files error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error reindexing files'
    });
  }
};

module.exports = {
  searchFiles,
  searchMetadata,
  reindexFiles
};
