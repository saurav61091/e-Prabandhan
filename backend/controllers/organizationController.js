const OrganizationService = require('../services/organizationService');
const { validateSchema } = require('../utils/validation');
const { organizationSchema } = require('../validation/organizationSchema');
const createError = require('http-errors');

/**
 * Create a new organization
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const createOrganization = async (req, res) => {
  try {
    // Validate request body
    await validateSchema(organizationSchema.create, req.body);

    // Create organization
    const organization = await OrganizationService.createOrganization(
      req.body,
      req.user.id
    );

    res.status(201).json({
      message: 'Organization created successfully',
      organization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error creating organization'
    });
  }
};

/**
 * Update organization details
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const updateOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;

    // Validate request body
    await validateSchema(organizationSchema.update, req.body);

    // Update organization
    const organization = await OrganizationService.updateOrganization(
      orgId,
      req.body,
      req.user.id
    );

    res.json({
      message: 'Organization updated successfully',
      organization
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error updating organization'
    });
  }
};

/**
 * Get organization details
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;

    // Get organization details
    const organization = await OrganizationService.getOrganization(orgId);

    res.json(organization);
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error getting organization details'
    });
  }
};

/**
 * Get organization hierarchy
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getHierarchy = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { depth } = req.query;

    // Get organization hierarchy
    const hierarchy = await OrganizationService.getHierarchy(
      orgId,
      depth ? parseInt(depth) : null
    );

    res.json(hierarchy);
  } catch (error) {
    console.error('Get hierarchy error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error getting organization hierarchy'
    });
  }
};

/**
 * Search organizations
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const searchOrganizations = async (req, res) => {
  try {
    // Validate query parameters
    await validateSchema(organizationSchema.search, req.query);

    // Search organizations
    const results = await OrganizationService.searchOrganizations(req.query);

    res.json(results);
  } catch (error) {
    console.error('Search organizations error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error searching organizations'
    });
  }
};

/**
 * Get organization statistics
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const getStatistics = async (req, res) => {
  try {
    // Get organization statistics
    const stats = await OrganizationService.getStatistics();

    res.json(stats);
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error getting organization statistics'
    });
  }
};

/**
 * Move organization to new parent
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const moveOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { newParentId } = req.body;

    // Validate request body
    await validateSchema(organizationSchema.move, {
      orgId,
      newParentId
    });

    // Move organization
    const organization = await OrganizationService.moveOrganization(
      orgId,
      newParentId,
      req.user.id
    );

    res.json({
      message: 'Organization moved successfully',
      organization
    });
  } catch (error) {
    console.error('Move organization error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Error moving organization'
    });
  }
};

module.exports = {
  createOrganization,
  updateOrganization,
  getOrganization,
  getHierarchy,
  searchOrganizations,
  getStatistics,
  moveOrganization
};
