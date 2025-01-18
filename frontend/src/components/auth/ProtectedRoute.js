/**
 * Protected Route Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * Features include:
 * - Authentication check
 * - Role-based access control
 * - Redirect to login
 * - Loading state handling
 * 
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

/**
 * Protected Route Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} [props.allowedRoles] - Optional list of roles that can access this route
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);

  /**
   * Check if user has required role
   * @returns {boolean} True if user has required role or no roles specified
   */
  const hasRequiredRole = () => {
    if (!allowedRoles) return true;
    return user && allowedRoles.some(role => user.roles.includes(role));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;
