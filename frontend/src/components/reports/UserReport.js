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
  Person as UserIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  DateRange as DateIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import ErrorAlert from '../common/ErrorAlert';

const UserReport = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    startDate: null,
    endDate: null,
    department: '',
    role: '',
    status: ''
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const { report, loading, error } = useSelector(state => state.userReport);

  React.useEffect(() => {
    const fetchReport = async () => {
      try {
        // await dispatch(fetchUserReport(filters)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    };
    fetchReport();
  }, [filters, page, rowsPerPage]);

  const handleExport = async (format) => {
    try {
      // await dispatch(exportUserReport({ ...filters, format })).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReport = async () => {
    try {
      // await dispatch(emailUserReport(filters)).unwrap();
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
          User Activity Report
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
                Total Users
              </Typography>
              <Typography variant="h4">
                {report?.summary?.totalUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {report?.summary?.activeUsers || 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Session Time
              </Typography>
              <Typography variant="h4">
                {report?.summary?.avgSessionTime || '0m'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                New Users
              </Typography>
              <Typography variant="h4">
                {report?.summary?.newUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                User Growth
              </Typography>
              <Typography variant="h4">
                {report?.summary?.growth || '0%'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Month over month
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                {report?.departments?.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="">All</MenuItem>
                {report?.roles?.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
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
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell>Sessions</TableCell>
              <TableCell>Avg. Duration</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Tasks</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(report?.users || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <UserIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2">
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {format(new Date(user.lastActive), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{user.sessions}</TableCell>
                <TableCell>{user.avgDuration}</TableCell>
                <TableCell>{user.documents}</TableCell>
                <TableCell>{user.tasks}</TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={
                      user.status === 'active' ? 'success' :
                      user.status === 'inactive' ? 'warning' : 'error'
                    }
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
          count={report?.users?.length || 0}
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

export default UserReport;
