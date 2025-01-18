import React from 'react';
import { useSelector } from 'react-redux';
import {
  IconButton,
  Badge,
  Tooltip,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import {
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
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = ({ onOpenCenter }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { notifications } = useSelector(state => state.notification);
  const unreadNotifications = notifications.filter(n => !n.read);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    handleClose();
    onOpenCenter();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
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

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
        >
          <Badge
            badgeContent={unreadNotifications.length}
            color="error"
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle1">
            Recent Notifications
          </Typography>
          {unreadNotifications.length > 0 && (
            <Typography variant="caption" color="error">
              {unreadNotifications.length} unread
            </Typography>
          )}
        </Box>

        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {unreadNotifications.length === 0 ? (
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
                No new notifications
              </Typography>
            </Box>
          ) : (
            unreadNotifications.slice(0, 5).map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>

        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Button
            fullWidth
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={handleViewAll}
          >
            View All Notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
