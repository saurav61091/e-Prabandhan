import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary,
  Avatar,
  Chip,
  Tooltip,
  LinearProgress,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Person as UserIcon,
  Assignment as TaskIcon,
  Description as DocumentIcon,
  Notifications as NotificationIcon,
  Schedule as DeadlineIcon,
  Event as EventIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import ErrorAlert from '../common/ErrorAlert';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const { dashboard, loading, error } = useSelector(state => state.userDashboard);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // await dispatch(fetchUserDashboard()).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    };
    fetchDashboard();
  }, []);

  const handleRefresh = async () => {
    try {
      // await dispatch(fetchUserDashboard()).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={dashboard?.user?.avatar}
            alt={dashboard?.user?.name}
            sx={{ width: 56, height: 56 }}
          />
          <Box>
            <Typography variant="h5">
              Welcome back, {dashboard?.user?.name}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dashboard?.user?.role} • {dashboard?.user?.department}
            </Typography>
          </Box>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Badge
                  badgeContent={dashboard?.taskStats?.pending || 0}
                  color="warning"
                >
                  <TaskIcon color="primary" />
                </Badge>
                <Typography variant="h6">
                  My Tasks
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {dashboard?.taskStats?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboard?.taskStats?.completed || 0} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Badge
                  badgeContent={dashboard?.documentStats?.new || 0}
                  color="success"
                >
                  <DocumentIcon color="primary" />
                </Badge>
                <Typography variant="h6">
                  Documents
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {dashboard?.documentStats?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboard?.documentStats?.shared || 0} shared with me
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Badge
                  badgeContent={dashboard?.notificationStats?.unread || 0}
                  color="error"
                >
                  <NotificationIcon color="primary" />
                </Badge>
                <Typography variant="h6">
                  Notifications
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {dashboard?.notificationStats?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboard?.notificationStats?.today || 0} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Badge
                  badgeContent={dashboard?.eventStats?.upcoming || 0}
                  color="info"
                >
                  <EventIcon color="primary" />
                </Badge>
                <Typography variant="h6">
                  Events
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {dashboard?.eventStats?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboard?.eventStats?.today || 0} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Progress */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Task Progress
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard?.taskProgress || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <ChartTooltip
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#2e7d32"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="assigned"
                  name="Assigned"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Notifications */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <List>
              {(dashboard?.recentNotifications || []).map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1
                  }}
                >
                  <ListItemIcon>
                    {notification.type === 'task' ? <TaskIcon color="primary" /> :
                     notification.type === 'document' ? <DocumentIcon color="primary" /> :
                     notification.type === 'message' ? <ChatIcon color="primary" /> :
                     <NotificationIcon color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Active Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Tasks
            </Typography>
            <List>
              {(dashboard?.activeTasks || []).map((task) => (
                <ListItem
                  key={task.id}
                  secondaryAction={
                    <Chip
                      size="small"
                      label={task.status}
                      color={
                        task.status === 'In Progress' ? 'primary' :
                        task.status === 'Review' ? 'secondary' : 'default'
                      }
                    />
                  }
                >
                  <ListItemIcon>
                    <TaskIcon color={task.priority === 'high' ? 'error' : 'primary'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Due {format(new Date(task.deadline), 'MMM d, h:mm a')}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          color={
                            task.progress < 30 ? 'error' :
                            task.progress < 70 ? 'warning' : 'success'
                          }
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <List>
              {(dashboard?.upcomingEvents || []).map((event) => (
                <ListItem
                  key={event.id}
                  secondaryAction={
                    <Chip
                      size="small"
                      label={event.type}
                      color={
                        event.type === 'Meeting' ? 'primary' :
                        event.type === 'Training' ? 'secondary' : 'default'
                      }
                    />
                  }
                >
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {format(new Date(event.date), 'MMM d, h:mm a')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.location || 'Online'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Activity Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Summary
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard?.activitySummary || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar
                  dataKey="tasks"
                  name="Tasks"
                  fill="#1976d2"
                />
                <Bar
                  dataKey="documents"
                  name="Documents"
                  fill="#2e7d32"
                />
                <Bar
                  dataKey="comments"
                  name="Comments"
                  fill="#ed6c02"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;
