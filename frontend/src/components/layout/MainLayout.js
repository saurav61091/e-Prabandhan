/**
 * Main Layout Component
 * 
 * The root layout component that provides the basic structure for the application.
 * Features include:
 * - Responsive layout with sidebar and header
 * - Dynamic sidebar toggling
 * - Content area with proper spacing
 * - Theme-aware styling
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

/**
 * Constants for layout dimensions
 */
const DRAWER_WIDTH = 240;
const MOBILE_DRAWER_WIDTH = '100%';

/**
 * Main Layout Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the main content area
 * @returns {JSX.Element} Main layout component
 */
const MainLayout = ({ children }) => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  /**
   * Toggle mobile sidebar
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      fetchPendingTaskCount();
    }
  }, [user]);

  /**
   * Fetch notification count from API
   */
  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get('/api/workflow-notifications/unread/count');
      setUnreadNotifications(response.data.count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  /**
   * Fetch pending task count from API
   */
  const fetchPendingTaskCount = async () => {
    try {
      const response = await axios.get('/api/workflow/tasks/pending/count');
      setPendingTasks(response.data.count);
    } catch (error) {
      console.error('Error fetching pending task count:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      {/* Header */}
      <Header
        onDrawerToggle={handleDrawerToggle}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Sidebar */}
      <Sidebar
        open={mobileOpen}
        onClose={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'permanent'}
        width={isMobile ? MOBILE_DRAWER_WIDTH : DRAWER_WIDTH}
        unreadNotifications={unreadNotifications}
        pendingTasks={pendingTasks}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px', // Header height
          height: '100vh',
          overflow: 'auto',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default MainLayout;
