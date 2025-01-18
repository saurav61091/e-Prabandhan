import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
    handleClose();
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" color="textPrimary">
            {user?.name}
          </Typography>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0) || <AccountCircleIcon />}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfile}>
            <AccountCircleIcon sx={{ mr: 2 }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <SettingsIcon sx={{ mr: 2 }} /> Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 2 }} /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
