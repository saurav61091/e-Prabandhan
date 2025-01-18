import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  LinearProgress
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Assignment as TaskIcon,
  Description as DocumentIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Business as DepartmentIcon,
  Group as TeamIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ActivityTimeline = ({ activities }) => {
  const getTimelineIcon = (type) => {
    switch (type) {
      case 'task':
        return <TaskIcon />;
      case 'document':
        return <DocumentIcon />;
      case 'comment':
        return <CommentIcon />;
      case 'edit':
        return <EditIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'share':
        return <ShareIcon />;
      case 'upload':
        return <UploadIcon />;
      case 'download':
        return <DownloadIcon />;
      case 'department':
        return <DepartmentIcon />;
      case 'team':
        return <TeamIcon />;
      case 'settings':
        return <SettingsIcon />;
      case 'notification':
        return <NotificationIcon />;
      default:
        return <TaskIcon />;
    }
  };

  const getTimelineColor = (type) => {
    switch (type) {
      case 'task':
        return 'primary';
      case 'document':
        return 'secondary';
      case 'comment':
        return 'info';
      case 'edit':
        return 'warning';
      case 'delete':
        return 'error';
      case 'share':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Timeline>
      {activities.map((activity, index) => (
        <TimelineItem key={activity.id}>
          <TimelineOppositeContent color="text.secondary">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color={getTimelineColor(activity.type)}>
              {getTimelineIcon(activity.type)}
            </TimelineDot>
            {index < activities.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="subtitle1">
              {activity.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activity.description}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

const UserActivity = ({ userId }) => {
  const [timeRange, setTimeRange] = React.useState('7d');
  const [activityType, setActivityType] = React.useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const { activities, stats, loading, error } = useSelector(state => state.activity);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Activity Overview
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Activity Type</InputLabel>
            <Select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              label="Activity Type"
            >
              <MenuItem value="all">All Activities</MenuItem>
              <MenuItem value="task">Tasks</MenuItem>
              <MenuItem value="document">Documents</MenuItem>
              <MenuItem value="comment">Comments</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            <ActivityTimeline activities={activities} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Activity Distribution
                </Typography>
                <Box height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.distribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {stats.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Activity Trends
                </Typography>
                <Box height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.trends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MMM d')}
                      />
                      <YAxis />
                      <ChartTooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        name="Activities"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Export Activity Report</MenuItem>
        <MenuItem onClick={handleMenuClose}>Configure Notifications</MenuItem>
        <MenuItem onClick={handleMenuClose}>Clear Activity History</MenuItem>
      </Menu>
    </Box>
  );
};

export default UserActivity;
