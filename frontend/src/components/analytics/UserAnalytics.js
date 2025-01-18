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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Person as UserIcon,
  Group as TeamIcon,
  TrendingUp as ActivityIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
  Download as ExportIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import ErrorAlert from '../common/ErrorAlert';

const UserAnalytics = () => {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = React.useState('7d');
  const { analytics, loading, error } = useSelector(state => state.analytics);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // await dispatch(fetchUserAnalytics(timeRange)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  const handleExport = async (format) => {
    try {
      // await dispatch(exportAnalytics({ timeRange, format })).unwrap();
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
          User Analytics
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              size="small"
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Export Data">
            <IconButton onClick={() => handleExport('csv')}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <UserIcon color="primary" />
                <Typography variant="h6">
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.totalUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.userGrowth > 0 ? '+' : ''}{analytics?.userGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <ActivityIcon color="primary" />
                <Typography variant="h6">
                  Active Users
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.activeUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.activeUserGrowth > 0 ? '+' : ''}{analytics?.activeUserGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TeamIcon color="primary" />
                <Typography variant="h6">
                  Teams
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.totalTeams || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.teamGrowth > 0 ? '+' : ''}{analytics?.teamGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TimeIcon color="primary" />
                <Typography variant="h6">
                  Avg. Session
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.avgSessionTime || 0}m
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.sessionGrowth > 0 ? '+' : ''}{analytics?.sessionGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* User Growth Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Growth
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.userGrowthData || []}>
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
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Users"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  name="Active Users"
                  stroke="#2e7d32"
                  fill="#2e7d32"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.userDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#1976d2"
                  label
                >
                  {analytics?.userDistribution?.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Activity by Hour */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity by Hour
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.hourlyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar
                  dataKey="sessions"
                  name="Sessions"
                  fill="#1976d2"
                />
                <Bar
                  dataKey="actions"
                  name="Actions"
                  fill="#2e7d32"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Retention */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Retention
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.retentionData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <ChartTooltip
                  formatter={(value) => [`${value}%`, 'Retention Rate']}
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Retention Rate"
                  stroke="#1976d2"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserAnalytics;
