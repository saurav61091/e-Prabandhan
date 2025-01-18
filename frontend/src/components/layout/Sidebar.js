/**
 * Sidebar Component
 * 
 * The application's main navigation sidebar.
 * Features include:
 * - Responsive drawer
 * - Navigation menu with icons
 * - Active route highlighting
 * - Nested menu items
 * - Badge indicators for notifications
 * - Role-based menu items
 * 
 * @component
 */

import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Navigation menu items configuration
 */
const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon
  },
  {
    title: 'Workflow Templates',
    path: '/workflow/templates',
    icon: DescriptionIcon
  },
  {
    title: 'Task Inbox',
    path: '/workflow/tasks',
    icon: AssignmentIcon,
    badge: true
  },
  {
    title: 'SLA Dashboard',
    path: '/workflow/sla',
    icon: TimelineIcon
  },
  {
    title: 'Metrics',
    path: '/workflow/metrics',
    icon: AssessmentIcon
  },
  {
    title: 'Notifications',
    path: '/workflow/notifications',
    icon: NotificationsIcon,
    badge: true
  }
];

/**
 * Sidebar Component
 * 
 * @param {Object} props - Component props
 * @param {number} props.unreadNotifications - Number of unread notifications
 * @param {number} props.pendingTasks - Number of pending tasks
 * @returns {JSX.Element} Sidebar component
 */
const Sidebar = ({ unreadNotifications = 0, pendingTasks = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  /**
   * Check if a path is currently active
   * @param {string} path - Path to check
   * @returns {boolean} Whether the path is active
   */
  const isPathActive = (path) => {
    return location.pathname === path;
  };

  /**
   * Render a menu item
   * @param {Object} item - Menu item configuration
   * @returns {JSX.Element} Menu item component
   */
  const renderMenuItem = (item) => {
    const isActive = isPathActive(item.path);

    return (
      <ListItem
        button
        key={item.path}
        onClick={() => handleNavigation(item.path)}
        selected={isActive}
        sx={{
          '&.Mui-selected': {
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }
        }}
      >
        <ListItemIcon>
          {item.badge ? (
            <Badge
              badgeContent={
                item.path === '/workflow/notifications'
                  ? unreadNotifications
                  : item.path === '/workflow/tasks'
                  ? pendingTasks
                  : 0
              }
              color="error"
            >
              <item.icon color={isActive ? 'primary' : 'inherit'} />
            </Badge>
          ) : (
            <item.icon color={isActive ? 'primary' : 'inherit'} />
          )}
        </ListItemIcon>
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            color: isActive ? 'primary' : 'inherit'
          }}
        />
      </ListItem>
    );
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto' }}>
      {/* Logo */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary">
          e-Prabandhan
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.name || 'User'}
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </Box>
  );

  const drawerWidth = 240;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
