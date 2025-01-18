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
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  LinearProgress
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Group as MembersIcon,
  Description as DocumentIcon,
  Assignment as TaskIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon
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
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

const DepartmentMetrics = ({ departmentId }) => {
  const [timeRange, setTimeRange] = React.useState('7d');
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const { metrics, loading, error } = useSelector(state => state.department);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  if (loading) {
    return <LinearProgress />;
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
          Department Metrics
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
            title="Total Members"
            value={metrics.memberCount}
            trend="up"
            trendValue={5}
            icon={MembersIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Documents"
            value={metrics.documentCount}
            trend="up"
            trendValue={12}
            icon={DocumentIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Tasks"
            value={metrics.taskCount}
            trend="down"
            trendValue={8}
            icon={TaskIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Activity Score"
            value={metrics.activityScore}
            trend="up"
            trendValue={15}
            icon={TimelineIcon}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Activity
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={metrics.documentActivity}
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
                    dataKey="created"
                    stroke="#8884d8"
                    name="Created"
                  />
                  <Line
                    type="monotone"
                    dataKey="modified"
                    stroke="#82ca9d"
                    name="Modified"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Task Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.taskDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {metrics.taskDistribution.map((entry, index) => (
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
              Member Performance
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.memberPerformance}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="tasks" fill="#8884d8" name="Tasks Completed" />
                  <Bar dataKey="documents" fill="#82ca9d" name="Documents Processed" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
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

export default DepartmentMetrics;
