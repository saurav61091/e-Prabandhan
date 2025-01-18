const { Op } = require('sequelize');
const File = require('../models/File');
const Department = require('../models/Department');
const User = require('../models/User');
const elasticClient = require('../config/elasticsearch');
const { sanitizeQuery, buildElasticQuery } = require('../utils/searchUtils');
const createError = require('http-errors');

class SearchService {
  /**
   * Perform advanced search across files and metadata
   * @param {Object} params Search parameters
   * @returns {Promise<Object>} Search results with pagination
   */
  static async searchFiles({
    query,
    filters = {},
    sort = {},
    page = 1,
    limit = 20,
    userId,
    departmentId
  }) {
    try {
      const {
        dateRange,
        fileTypes,
        tags,
        size,
        creator,
        lastModified,
        status,
        metadata = {}
      } = filters;

      // Build Elasticsearch query
      const esQuery = buildElasticQuery({
        query: sanitizeQuery(query),
        filters: {
          dateRange,
          fileTypes,
          tags,
          size,
          creator,
          lastModified,
          status,
          metadata
        }
      });

      // Add access control filters
      esQuery.bool.filter.push({
        bool: {
          should: [
            { term: { 'createdBy': userId } },
            { term: { 'departmentId': departmentId } },
            { term: { 'isPublic': true } },
            { terms: { 'sharedWith': [userId] } }
          ]
        }
      });

      // Execute Elasticsearch search
      const esResult = await elasticClient.search({
        index: 'files',
        body: {
          query: esQuery,
          sort: this._buildSortCriteria(sort),
          from: (page - 1) * limit,
          size: limit,
          aggs: {
            file_types: {
              terms: { field: 'fileType' }
            },
            tags: {
              terms: { field: 'tags' }
            },
            creators: {
              terms: { field: 'createdBy' }
            },
            departments: {
              terms: { field: 'departmentId' }
            },
            size_ranges: {
              range: {
                field: 'size',
                ranges: [
                  { to: 1024 * 1024 }, // 0-1MB
                  { from: 1024 * 1024, to: 5 * 1024 * 1024 }, // 1-5MB
                  { from: 5 * 1024 * 1024, to: 20 * 1024 * 1024 }, // 5-20MB
                  { from: 20 * 1024 * 1024 } // >20MB
                ]
              }
            },
            date_histogram: {
              date_histogram: {
                field: 'createdAt',
                calendar_interval: 'month'
              }
            }
          },
          highlight: {
            fields: {
              'content': {},
              'metadata.*': {},
              'comments.text': {}
            }
          }
        }
      });

      // Get file details from database
      const fileIds = esResult.hits.hits.map(hit => hit._id);
      const files = await File.findAll({
        where: { id: fileIds },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }
        ]
      });

      // Merge Elasticsearch results with database records
      const results = esResult.hits.hits.map(hit => {
        const file = files.find(f => f.id === hit._id);
        return {
          ...file.toJSON(),
          score: hit._score,
          highlights: hit.highlight,
          matchedMetadata: hit._source.metadata
        };
      });

      return {
        results,
        total: esResult.hits.total.value,
        page,
        limit,
        facets: {
          fileTypes: esResult.aggregations.file_types.buckets,
          tags: esResult.aggregations.tags.buckets,
          creators: esResult.aggregations.creators.buckets,
          departments: esResult.aggregations.departments.buckets,
          sizeRanges: esResult.aggregations.size_ranges.buckets,
          dateHistogram: esResult.aggregations.date_histogram.buckets
        }
      };
    } catch (error) {
      console.error('Search error:', error);
      throw createError(500, 'Error performing search');
    }
  }

  /**
   * Search file metadata
   * @param {Object} params Search parameters
   * @returns {Promise<Array>} Matching metadata fields
   */
  static async searchMetadata({
    field,
    value,
    type = 'prefix',
    limit = 10
  }) {
    try {
      const query = {
        bool: {
          must: [
            {
              exists: {
                field: `metadata.${field}`
              }
            }
          ]
        }
      };

      if (type === 'prefix') {
        query.bool.must.push({
          prefix: {
            [`metadata.${field}`]: value.toLowerCase()
          }
        });
      } else if (type === 'term') {
        query.bool.must.push({
          term: {
            [`metadata.${field}`]: value.toLowerCase()
          }
        });
      }

      const result = await elasticClient.search({
        index: 'files',
        body: {
          query,
          aggs: {
            unique_values: {
              terms: {
                field: `metadata.${field}`,
                size: limit
              }
            }
          },
          size: 0
        }
      });

      return result.aggregations.unique_values.buckets.map(bucket => ({
        value: bucket.key,
        count: bucket.doc_count
      }));
    } catch (error) {
      console.error('Metadata search error:', error);
      throw createError(500, 'Error searching metadata');
    }
  }

  /**
   * Build sort criteria for Elasticsearch
   * @param {Object} sort Sort parameters
   * @returns {Array} Elasticsearch sort criteria
   * @private
   */
  static _buildSortCriteria(sort) {
    const sortCriteria = [];

    if (sort.field) {
      sortCriteria.push({
        [sort.field]: {
          order: sort.order || 'desc'
        }
      });
    }

    // Add score-based sorting if there's a query
    sortCriteria.push('_score');

    // Default to latest first
    sortCriteria.push({
      createdAt: {
        order: 'desc'
      }
    });

    return sortCriteria;
  }

  /**
   * Reindex all files in Elasticsearch
   * @returns {Promise<void>}
   */
  static async reindexFiles() {
    try {
      const files = await File.findAll({
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }
        ]
      });

      // Prepare bulk indexing operations
      const operations = files.flatMap(file => [
        { index: { _index: 'files', _id: file.id } },
        {
          id: file.id,
          name: file.name,
          fileType: file.fileType,
          size: file.size,
          content: file.content,
          metadata: file.metadata,
          tags: file.tags,
          createdBy: file.createdBy,
          departmentId: file.departmentId,
          isPublic: file.isPublic,
          sharedWith: file.sharedWith,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
          creator: {
            id: file.creator.id,
            name: file.creator.name,
            email: file.creator.email
          },
          department: file.department ? {
            id: file.department.id,
            name: file.department.name
          } : null
        }
      ]);

      // Perform bulk indexing
      await elasticClient.bulk({
        refresh: true,
        body: operations
      });
    } catch (error) {
      console.error('Reindex error:', error);
      throw createError(500, 'Error reindexing files');
    }
  }
}

module.exports = SearchService;
