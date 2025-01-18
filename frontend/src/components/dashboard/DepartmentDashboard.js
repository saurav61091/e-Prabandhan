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
  Chip,
  Tooltip,
  LinearProgress,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Business as DepartmentIcon,
  Person as UserIcon,
  Assignment as TaskIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingIcon,
  Schedule as DeadlineIcon,
  Group as TeamIcon,
  Event as EventIcon,
  Chat as ChatIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
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

const DepartmentDashboard = () => {
  const dispatch = useDispatch();
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const { dashboard, loading, error } = useSelector(state => state.departmentDashboard);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // await dispatch(fetchDepartmentDashboard()).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    };
    fetchDashboard();
  }, []);

  const handleRefresh = async () => {
    try {
      // await dispatch(fetchDepartmentDashboard()).unwrap();
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
          <DepartmentIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h5">
              {dashboard?.department?.name || 'Department Dashboard'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manager: {dashboard?.department?.manager?.name}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Task
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
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
                  badgeContent={dashboard?.memberStats?.new || 0}
                  color="primary"
                >
                  <TeamIcon color="primary" />
                </Badge>
                <Typography variant="h6">
                  Members
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {dashboard?.memberStats?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboard?.memberStats?.active || 0} active now
              </Typography>
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
              <Box display="flex" alignItems="center" gap={0.5}>
                <TrendingIcon
                  color={dashboard?.taskStats?.completionRate > 70 ? 'success' : 'warning'}
                  fontSize="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {dashboard?.taskStats?.completionRate || 0}% completion rate
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
              Task Progress
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard?.taskProgress || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#2e7d32"
                  stackId="a"
                />
                <Bar
                  dataKey="inProgress"
                  name="In Progress"
                  fill="#ed6c02"
                  stackId="a"
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill="#d32f2f"
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Team Members */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Team Members
              </Typography>
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreIcon />
              </IconButton>
            </Box>
            <List>
              {(dashboard?.teamMembers || []).map((member) => (
                <ListItem
                  key={member.id}
                  secondaryAction={
                    <Chip
                      size="small"
                      label={member.role}
                      color={member.role === 'Manager' ? 'primary' : 'default'}
                    />
                  }
                >
                  <ListItemIcon>
                    <Avatar src={member.avatar} alt={member.name} />
                  </ListItemIcon>
                  <ListItemText
                    primary={member.name}
                    secondary={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Badge
                          color={member.status === 'online' ? 'success' : 'default'}
                          variant="dot"
                        />
                        <Typography variant="caption">
                          {member.status}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tasks
            </Typography>
            <List>
              {(dashboard?.recentTasks || []).map((task) => (
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
                    secondary={format(new Date(event.date), 'MMM d, h:mm a')}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Communication Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Communication Activity
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboard?.communicationActivity || []}>
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
                  dataKey="messages"
                  name="Messages"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  name="Comments"
                  stroke="#2e7d32"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem>View All Members</MenuItem>
        <MenuItem>Add Member</MenuItem>
        <MenuItem>Manage Roles</MenuItem>
      </Menu>
    </Box>
  );
};

export default DepartmentDashboard;
