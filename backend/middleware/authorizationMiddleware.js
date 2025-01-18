const createError = require('http-errors');

/**
 * Middleware to check if user has required roles
 * @param {string[]} requiredRoles - Array of required roles
 * @returns {Function} Express middleware
 */
const authorize = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, 'Authentication required');
      }

      const hasRequiredRole = requiredRoles.some(role => req.user.role === role);
      
      if (!hasRequiredRole) {
        throw createError(403, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has required clearance level
 * @param {number} requiredClearance - Required clearance level
 * @returns {Function} Express middleware
 */
const requireClearance = (requiredClearance) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, 'Authentication required');
      }

      const userClearance = req.user.clearanceLevel || 0;
      
      if (userClearance < requiredClearance) {
        throw createError(403, 'Insufficient clearance level');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has access to a department
 * @param {string} departmentParam - Name of the parameter containing department ID
 * @returns {Function} Express middleware
 */
const requireDepartmentAccess = (departmentParam = 'departmentId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, 'Authentication required');
      }

      const departmentId = req.params[departmentParam] || req.body[departmentParam];
      
      if (!departmentId) {
        throw createError(400, 'Department ID is required');
      }

      // Admin has access to all departments
      if (req.user.role === 'admin') {
        return next();
      }

      // Users can only access their own department
      if (req.user.department !== departmentId) {
        throw createError(403, 'Access denied to this department');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user owns the resource or has admin rights
 * @param {string} userIdField - Field name containing the user ID to check against
 * @returns {Function} Express middleware
 */
const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, 'Authentication required');
      }

      const resourceUserId = req.params[userIdField] || req.body[userIdField];

      if (!resourceUserId) {
        throw createError(400, 'User ID is required');
      }

      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Users can only access their own resources
      if (req.user.id !== resourceUserId) {
        throw createError(403, 'Access denied to this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has required permissions
 * @param {string[]} requiredPermissions - Array of required permissions
 * @returns {Function} Express middleware
 */
const requirePermissions = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, 'Authentication required');
      }

      const userPermissions = req.user.permissions || [];
      
      const hasAllPermissions = requiredPermissions.every(
        permission => userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        throw createError(403, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorize,
  requireClearance,
  requireDepartmentAccess,
  requireOwnership,
  requirePermissions
};
