import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Business as DepartmentIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  DateRange as DateIcon,
  TrendingUp as TrendingIcon,
  Group as TeamIcon,
  Assignment as TaskIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
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

const DepartmentReport = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    startDate: null,
    endDate: null,
    metric: 'efficiency',
    status: ''
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const { report, loading, error } = useSelector(state => state.departmentReport);

  React.useEffect(() => {
    const fetchReport = async () => {
      try {
        // await dispatch(fetchDepartmentReport(filters)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    };
    fetchReport();
  }, [filters, page, rowsPerPage]);

  const handleExport = async (format) => {
    try {
      // await dispatch(exportDepartmentReport({ ...filters, format })).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReport = async () => {
    try {
      // await dispatch(emailDepartmentReport(filters)).unwrap();
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
          Department Performance Report
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('excel')}
          >
            Export Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={handleEmailReport}
          >
            Email Report
          </Button>
        </Box>
      </Box>

      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      {/* Report Summary */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Departments
              </Typography>
              <Typography variant="h4">
                {report?.summary?.totalDepartments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {report?.summary?.activeDepartments || 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Efficiency
              </Typography>
              <Typography variant="h4">
                {report?.summary?.avgEfficiency || '0%'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">
                {report?.summary?.totalTasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {report?.summary?.completedTasks || 0} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Document Activity
              </Typography>
              <Typography variant="h4">
                {report?.summary?.documentActivity || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => setFilters({ ...filters, startDate: date })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => setFilters({ ...filters, endDate: date })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Metric</InputLabel>
              <Select
                value={filters.metric}
                onChange={(e) => setFilters({ ...filters, metric: e.target.value })}
                label="Metric"
              >
                <MenuItem value="efficiency">Efficiency</MenuItem>
                <MenuItem value="tasks">Tasks</MenuItem>
                <MenuItem value="documents">Documents</MenuItem>
                <MenuItem value="team">Team Size</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Performance Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Department Performance Trends
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={report?.performanceTrends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
            />
            <YAxis />
            <ChartTooltip
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
            />
            <Legend />
            {report?.departments?.map((dept, index) => (
              <Line
                key={dept.id}
                type="monotone"
                dataKey={dept.name}
                name={dept.name}
                stroke={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Report Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Department</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Team Size</TableCell>
              <TableCell>Tasks</TableCell>
              <TableCell>Completion Rate</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Efficiency</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(report?.departments || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((dept) => (
              <TableRow key={dept.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DepartmentIcon color="primary" />
                    <Typography variant="subtitle2">
                      {dept.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{dept.manager}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TeamIcon fontSize="small" />
                    {dept.teamSize}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TaskIcon fontSize="small" />
                    {dept.tasks}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingIcon
                      fontSize="small"
                      color={dept.completionRate >= 70 ? 'success' : 'warning'}
                    />
                    {dept.completionRate}%
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DocumentIcon fontSize="small" />
                    {dept.documents}
                  </Box>
                </TableCell>
                <TableCell>{dept.activity}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingIcon
                      fontSize="small"
                      color={dept.efficiency >= 70 ? 'success' : 'warning'}
                    />
                    {dept.efficiency}%
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={dept.status}
                    color={dept.status === 'active' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={report?.departments?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default DepartmentReport;
