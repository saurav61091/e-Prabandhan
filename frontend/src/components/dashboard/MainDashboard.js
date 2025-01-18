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
  AvatarGroup,
  Tooltip,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as UserIcon,
  Business as DepartmentIcon,
  Description as DocumentIcon,
  Assignment as TaskIcon,
  Notifications as NotificationIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Schedule as DeadlineIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon
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

const MainDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading, error } = useSelector(state => state.dashboard);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // await dispatch(fetchDashboardData()).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    };
    fetchDashboard();
  }, []);

  const handleRefresh = async () => {
    try {
      // await dispatch(fetchDashboardData()).unwrap();
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
        <Typography variant="h5">
          Dashboard
        </Typography>
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
                  badgeContent={dashboard?.userStats?.newUsers || 0}
                  color="primary"
                >
                  <UserIcon color="primary" />
                </Badge>
                <Typography variant="h6">
                  Users
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {dashboard?.userStats?.total || 0}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <TrendingIcon
                  color={dashboard?.userStats?.trend > 0 ? 'success' : 'error'}
                  fontSize="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {dashboard?.userStats?.trend > 0 ? '+' : ''}{dashboard?.userStats?.trend || 0}% this week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

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
                  Tasks
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
                {dashboard?.documentStats?.storage || '0 MB'} used
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

        {/* Activity Timeline */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard?.activityTimeline || []}>
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
                  dataKey="tasks"
                  name="Tasks"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="documents"
                  name="Documents"
                  stroke="#2e7d32"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stroke="#ed6c02"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {(dashboard?.recentActivity || []).map((activity) => (
                <ListItem
                  key={activity.id}
                  sx={{
                    borderLeft: 3,
                    borderColor: activity.type === 'warning' ? 'warning.main' :
                               activity.type === 'success' ? 'success.main' :
                               'primary.main',
                    pl: 2,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={activity.description}
                    secondary={format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Task Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Task Status
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboard?.taskDistribution || []}
                  dataKey="value"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#1976d2"
                  label
                >
                  {dashboard?.taskDistribution?.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Department Performance */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Performance
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard?.departmentPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar
                  dataKey="tasks"
                  name="Tasks"
                  fill="#1976d2"
                />
                <Bar
                  dataKey="efficiency"
                  name="Efficiency"
                  fill="#2e7d32"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Deadlines
            </Typography>
            <List>
              {(dashboard?.upcomingDeadlines || []).map((task) => (
                <ListItem
                  key={task.id}
                  secondaryAction={
                    <AvatarGroup max={3}>
                      {task.assignees.map((assignee) => (
                        <Tooltip key={assignee.id} title={assignee.name}>
                          <Avatar
                            src={assignee.avatar}
                            alt={assignee.name}
                          />
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  }
                >
                  <ListItemIcon>
                    <DeadlineIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    secondary={`Due ${format(new Date(task.deadline), 'MMM d, h:mm a')}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <List>
              {(dashboard?.systemHealth || []).map((item) => (
                <ListItem key={item.id}>
                  <ListItemIcon>
                    {item.status === 'healthy' ? (
                      <SuccessIcon color="success" />
                    ) : (
                      <WarningIcon color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    secondary={item.description}
                  />
                  <Typography
                    variant="body2"
                    color={item.status === 'healthy' ? 'success.main' : 'warning.main'}
                  >
                    {item.value}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainDashboard;
