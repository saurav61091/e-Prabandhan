import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  NoteAdd as NotesheetIcon,
  Search as SearchIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const DRAWER_WIDTH = 280;

const MainLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user, notifications } = useSelector(state => ({
    user: state.auth.user,
    notifications: state.notifications.items
  }));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // dispatch(logout());
    navigate('/auth/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      children: [
        { text: 'Main Dashboard', path: '/' },
        { text: 'Department Dashboard', path: '/dashboard/department' },
        { text: 'User Dashboard', path: '/dashboard/user' }
      ]
    },
    {
      text: 'Documents',
      icon: <DocumentIcon />,
      path: '/documents',
      children: [
        { text: 'All Documents', path: '/documents' },
        { text: 'Upload Document', path: '/documents/upload' },
        { text: 'Search Documents', path: '/documents/search' }
      ]
    },
    {
      text: 'Notesheets',
      icon: <NotesheetIcon />,
      path: '/notesheets',
      children: [
        { text: 'All Notesheets', path: '/notesheets' },
        { text: 'Create Notesheet', path: '/notesheets/create' }
      ]
    },
    {
      text: 'Search',
      icon: <SearchIcon />,
      path: '/search',
      children: [
        { text: 'Global Search', path: '/search' },
        { text: 'Document Search', path: '/search/documents' },
        { text: 'User Search', path: '/search/users' }
      ]
    },
    {
      text: 'Reports',
      icon: <ReportIcon />,
      path: '/reports',
      children: [
        { text: 'User Reports', path: '/reports/users' },
        { text: 'Department Reports', path: '/reports/departments' },
        { text: 'Document Reports', path: '/reports/documents' }
      ]
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      children: [
        { text: 'General Settings', path: '/settings' },
        { text: 'Profile Settings', path: '/settings/profile' }
      ]
    }
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          e-Prabandhan
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
            {item.children && (
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <ListItemButton
                    key={child.text}
                    sx={{ pl: 4 }}
                    onClick={() => navigate(child.path)}
                    selected={location.pathname === child.path}
                  >
                    <ListItemText primary={child.text} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton color="inherit">
            <Badge badgeContent={notifications.length} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>

          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ ml: 2 }}
          >
            <Avatar
              alt={user?.name}
              src={user?.avatar}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate('/settings/profile')}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
