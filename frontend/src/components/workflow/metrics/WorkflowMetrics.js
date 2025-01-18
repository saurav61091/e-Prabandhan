import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  MoreVert as MoreIcon,
  CheckCircle as CompleteIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format, subDays } from 'date-fns';

const MetricCard = ({ title, value, trend, trendValue, icon: Icon }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
          </Typography>
          <Box display="flex" alignItems="center" mt={1}>
            {trend === 'up' ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : (
              <TrendingDownIcon color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={trend === 'up' ? 'success.main' : 'error.main'}
              sx={{ ml: 0.5 }}
            >
              {trendValue}%
            </Typography>
          </Box>
        </Box>
        <Icon color="primary" sx={{ fontSize: 40, opacity: 0.3 }} />
      </Box>
    </CardContent>
  </Card>
);

const WorkflowMetrics = () => {
  const [timeRange, setTimeRange] = React.useState('7d');
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const { metrics, loading, error } = useSelector(state => state.workflow);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Workflow Metrics
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
          <IconButton onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Workflows"
            value={metrics.activeWorkflows}
            trend="up"
            trendValue={12}
            icon={PendingIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completed Workflows"
            value={metrics.completedWorkflows}
            trend="up"
            trendValue={8}
            icon={CompleteIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Average Duration"
            value={`${metrics.avgDuration}h`}
            trend="down"
            trendValue={5}
            icon={Schedule}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="SLA Breaches"
            value={metrics.slaBreaches}
            trend="down"
            trendValue={15}
            icon={ErrorIcon}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Completion Trend
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metrics.completionTrend}
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
                    dataKey="completed"
                    stroke="#8884d8"
                    name="Completed"
                  />
                  <Line
                    type="monotone"
                    dataKey="started"
                    stroke="#82ca9d"
                    name="Started"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.departmentDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" />
                  <ChartTooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity Timeline
            </Typography>
            <Timeline>
              {metrics.recentActivity?.map((activity, index) => (
                <TimelineItem key={activity.id}>
                  <TimelineSeparator>
                    <TimelineDot
                      color={
                        activity.type === 'complete' ? 'success' :
                        activity.type === 'error' ? 'error' :
                        'primary'
                      }
                    />
                    {index < metrics.recentActivity.length - 1 && (
                      <TimelineConnector />
                    )}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body1">
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>
      </Grid>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Export Report</MenuItem>
        <MenuItem onClick={handleMenuClose}>Set Alerts</MenuItem>
        <MenuItem onClick={handleMenuClose}>Configure Metrics</MenuItem>
      </Menu>
    </Box>
  );
};

export default WorkflowMetrics;
