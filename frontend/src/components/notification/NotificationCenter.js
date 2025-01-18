import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondary,
  Avatar,
  Badge,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  MoreVert as MoreIcon,
  Notifications as NotificationsIcon,
  Assignment as TaskIcon,
  Description as DocumentIcon,
  Comment as CommentIcon,
  Group as TeamIcon,
  Business as DepartmentIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Done as DoneIcon,
  DeleteSweep as ClearIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({
  notification,
  onRead,
  onDelete,
  onAction
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'task':
        return <TaskIcon />;
      case 'document':
        return <DocumentIcon />;
      case 'comment':
        return <CommentIcon />;
      case 'team':
        return <TeamIcon />;
      case 'department':
        return <DepartmentIcon />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <ListItem
      sx={{
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        '&:hover': {
          bgcolor: 'action.selected'
        }
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: notification.read ? 'action.disabledBackground' : 'primary.main'
          }}
        >
          {getNotificationIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: notification.read ? 'normal' : 'bold'
            }}
          >
            {notification.title}
          </Typography>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </Typography>
          </Box>
        }
      />
      <Box>
        {notification.actionLabel && (
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAction(notification);
            }}
          >
            {notification.actionLabel}
          </Button>
        )}
        <IconButton
          size="small"
          onClick={handleMenuOpen}
        >
          <MoreIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onRead(notification);
          }}
        >
          Mark as {notification.read ? 'unread' : 'read'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete(notification);
          }}
          sx={{ color: 'error.main' }}
        >
          Remove
        </MenuItem>
      </Menu>
    </ListItem>
  );
};

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  const { notifications, loading, error } = useSelector(state => state.notification);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = async (notification) => {
    try {
      // await dispatch(markNotificationAsRead(notification.id)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleDelete = async (notification) => {
    try {
      // await dispatch(deleteNotification(notification.id)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleAction = async (notification) => {
    try {
      // await dispatch(handleNotificationAction(notification)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // await dispatch(markAllNotificationsAsRead()).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleClearAll = async () => {
    try {
      // await dispatch(clearAllNotifications()).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (tabValue) {
      case 0: // All
        return true;
      case 1: // Unread
        return !notification.read;
      case 2: // Tasks
        return notification.type === 'task';
      case 3: // Documents
        return notification.type === 'document';
      default:
        return true;
    }
  });

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={() => setOpen(true)}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6">
              Notifications
            </Typography>
            <Box>
              <IconButton onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All" />
              <Tab
                label={
                  <Badge badgeContent={unreadCount} color="error">
                    Unread
                  </Badge>
                }
              />
              <Tab label="Tasks" />
              <Tab label="Documents" />
            </Tabs>
          </Box>

          <Box
            sx={{
              p: 2,
              display: 'flex',
              gap: 1,
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <Button
              size="small"
              startIcon={<DoneIcon />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Clear all
            </Button>
            <Button
              size="small"
              startIcon={<SettingsIcon />}
            >
              Settings
            </Button>
          </Box>

          {loading ? (
            <LinearProgress />
          ) : (
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {filteredNotifications.length === 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  p={4}
                >
                  <NotificationsIcon
                    sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }}
                  />
                  <Typography color="text.secondary">
                    No notifications to display
                  </Typography>
                </Box>
              ) : (
                filteredNotifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onAction={handleAction}
                    />
                    <Divider component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationCenter;
