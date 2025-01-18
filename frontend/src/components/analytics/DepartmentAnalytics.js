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
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Business as DepartmentIcon,
  Assignment as TaskIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingIcon,
  Info as InfoIcon,
  Download as ExportIcon,
  ArrowUpward as IncreaseIcon,
  ArrowDownward as DecreaseIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  TreeMap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import ErrorAlert from '../common/ErrorAlert';

const DepartmentAnalytics = () => {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = React.useState('7d');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const { analytics, loading, error } = useSelector(state => state.analytics);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // await dispatch(fetchDepartmentAnalytics(timeRange)).unwrap();
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
          Department Analytics
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
                <DepartmentIcon color="primary" />
                <Typography variant="h6">
                  Total Departments
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.totalDepartments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.departmentGrowth > 0 ? '+' : ''}{analytics?.departmentGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TaskIcon color="primary" />
                <Typography variant="h6">
                  Active Tasks
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.activeTasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.taskGrowth > 0 ? '+' : ''}{analytics?.taskGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <DocumentIcon color="primary" />
                <Typography variant="h6">
                  Documents
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.totalDocuments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.documentGrowth > 0 ? '+' : ''}{analytics?.documentGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingIcon color="primary" />
                <Typography variant="h6">
                  Efficiency
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.efficiency || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.efficiencyGrowth > 0 ? '+' : ''}{analytics?.efficiencyGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Size Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Size Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <TreeMap
                data={analytics?.departmentSizes || []}
                dataKey="size"
                nameKey="name"
                aspectRatio={4/3}
              >
                <ChartTooltip
                  content={({ payload }) => {
                    if (payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <Box sx={{ p: 1, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle2">
                            {data.name}
                          </Typography>
                          <Typography variant="body2">
                            Members: {data.size}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
              </TreeMap>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Task Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Task Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.taskDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#1976d2"
                  label
                >
                  {analytics?.taskDistribution?.map((entry, index) => (
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
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Members</TableCell>
                    <TableCell align="right">Tasks</TableCell>
                    <TableCell align="right">Documents</TableCell>
                    <TableCell align="right">Efficiency</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(analytics?.departmentPerformance || [])
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell>{dept.name}</TableCell>
                        <TableCell align="right">{dept.members}</TableCell>
                        <TableCell align="right">{dept.tasks}</TableCell>
                        <TableCell align="right">{dept.documents}</TableCell>
                        <TableCell align="right">{dept.efficiency}%</TableCell>
                        <TableCell align="right">
                          {dept.trend > 0 ? (
                            <IncreaseIcon color="success" />
                          ) : (
                            <DecreaseIcon color="error" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={analytics?.departmentPerformance?.length || 0}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </Grid>

        {/* Activity Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.activityTimeline || []}>
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
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DepartmentAnalytics;
