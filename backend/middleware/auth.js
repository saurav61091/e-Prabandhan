/**
 * Authentication Middleware
 * 
 * This middleware handles JWT token verification and user authentication.
 * It extracts the JWT token from the request header, verifies it,
 * and attaches the user object to the request for use in protected routes.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT Token Middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * This middleware:
 * 1. Extracts the JWT token from the Authorization header
 * 2. Verifies the token using the JWT_SECRET
 * 3. Fetches the user from the database
 * 4. Attaches the user object to the request
 * 5. Handles various authentication errors
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id, status: 'active' } });

    if (!user) {
      throw new Error('User not found');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

/**
 * Check Role Middleware Factory
 * 
 * @param {...String} roles - Roles that are allowed to access the route
 * @returns {Function} Middleware function that checks if user has required role
 * 
 * Usage:
 * router.get('/admin-only', authorize('admin'), adminController.someAction);
 * router.get('/manager-or-admin', authorize('manager', 'admin'), someController.someAction);
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Please authenticate' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    next();
  };
};

module.exports = { auth, authorize };
