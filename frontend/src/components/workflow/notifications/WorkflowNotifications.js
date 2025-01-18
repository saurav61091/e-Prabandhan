import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondary,
  Typography,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Paper,
  Divider,
  Button,
  Menu,
  MenuItem,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const WorkflowNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/workflow-notifications', {
        params: {
          limit: ITEMS_PER_PAGE,
          offset: page * ITEMS_PER_PAGE,
          unreadOnly: currentTab === 1,
          type: selectedType !== 'all' ? selectedType : undefined,
          priority: selectedPriority !== 'all' ? selectedPriority : undefined
        }
      });

      if (page === 0) {
        setNotifications(response.data.rows);
      } else {
        setNotifications(prev => [...prev, ...response.data.rows]);
      }

      setHasMore(response.data.rows.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      enqueueSnackbar('Failed to fetch notifications', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, currentTab, selectedType, selectedPriority, enqueueSnackbar]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(0);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleMenuClick = (event, notification) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async () => {
    try {
      await axios.put(`/api/workflow-notifications/${selectedNotification.id}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === selectedNotification.id ? { ...n, read: true } : n
        )
      );
      enqueueSnackbar('Notification marked as read', { variant: 'success' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      enqueueSnackbar('Failed to mark notification as read', { variant: 'error' });
    }
    handleMenuClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/workflow-notifications/read/all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      enqueueSnackbar('All notifications marked as read', { variant: 'success' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      enqueueSnackbar('Failed to mark all notifications as read', { variant: 'error' });
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'task_assigned':
        return <NotificationsIcon color="primary" />;
      case 'task_completed':
        return <CheckCircleIcon color="success" />;
      case 'sla_warning':
        return <WarningIcon color="warning" />;
      case 'sla_breach':
        return <ErrorIcon color="error" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getPriorityChip = (priority) => {
    const colors = {
      low: 'default',
      medium: 'primary',
      high: 'warning',
      urgent: 'error'
    };

    return (
      <Chip
        size="small"
        label={priority}
        color={colors[priority]}
        sx={{ ml: 1 }}
      />
    );
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Notifications</Typography>
        <Box>
          <IconButton onClick={handleFilterClick}>
            <FilterListIcon />
          </IconButton>
          <Button onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        </Box>
      </Box>

      <Paper>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="All" />
          <Tab
            label={
              <Badge color="error" badgeContent={notifications.filter(n => !n.read).length}>
                Unread
              </Badge>
            }
          />
        </Tabs>

        <Divider />

        <List>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.read ? 'inherit' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type, notification.priority)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <Box component="span" display="flex" alignItems="center">
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      {getPriorityChip(notification.priority)}
                    </Box>
                  }
                />
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClick(e, notification);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : hasMore ? (
          <Box display="flex" justifyContent="center" p={2}>
            <Button onClick={handleLoadMore}>Load More</Button>
          </Box>
        ) : null}
      </Paper>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem>
          <Typography variant="subtitle2" color="textSecondary">
            Type
          </Typography>
        </MenuItem>
        <MenuItem
          selected={selectedType === 'all'}
          onClick={() => {
            setSelectedType('all');
            handleFilterClose();
          }}
        >
          All Types
        </MenuItem>
        <MenuItem
          selected={selectedType === 'task_assigned'}
          onClick={() => {
            setSelectedType('task_assigned');
            handleFilterClose();
          }}
        >
          Task Assigned
        </MenuItem>
        <MenuItem
          selected={selectedType === 'sla_warning'}
          onClick={() => {
            setSelectedType('sla_warning');
            handleFilterClose();
          }}
        >
          SLA Warning
        </MenuItem>
        <Divider />
        <MenuItem>
          <Typography variant="subtitle2" color="textSecondary">
            Priority
          </Typography>
        </MenuItem>
        {['all', 'low', 'medium', 'high', 'urgent'].map((priority) => (
          <MenuItem
            key={priority}
            selected={selectedPriority === priority}
            onClick={() => {
              setSelectedPriority(priority);
              handleFilterClose();
            }}
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMarkAsRead}>Mark as Read</MenuItem>
      </Menu>
    </Box>
  );
};

export default WorkflowNotifications;
