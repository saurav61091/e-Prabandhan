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

const drawerWidth = 240;

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

const Sidebar = ({ unreadNotifications = 0, pendingTasks = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

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
      <Box sx={{ overflow: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" color="primary">
            e-Prabandhan
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.name || 'User'}
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
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
                    <item.icon color={location.pathname === item.path ? 'primary' : 'inherit'} />
                  </Badge>
                ) : (
                  <item.icon color={location.pathname === item.path ? 'primary' : 'inherit'} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  color: location.pathname === item.path ? 'primary' : 'inherit'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
