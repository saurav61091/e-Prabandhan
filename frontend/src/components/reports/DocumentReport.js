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
  Description as DocumentIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  DateRange as DateIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Storage as StorageIcon,
  Category as CategoryIcon
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

const DocumentReport = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    startDate: null,
    endDate: null,
    type: '',
    department: '',
    status: ''
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const { report, loading, error } = useSelector(state => state.documentReport);

  React.useEffect(() => {
    const fetchReport = async () => {
      try {
        // await dispatch(fetchDocumentReport(filters)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    };
    fetchReport();
  }, [filters, page, rowsPerPage]);

  const handleExport = async (format) => {
    try {
      // await dispatch(exportDocumentReport({ ...filters, format })).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReport = async () => {
    try {
      // await dispatch(emailDocumentReport(filters)).unwrap();
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
          Document Activity Report
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
                Total Documents
              </Typography>
              <Typography variant="h4">
                {report?.summary?.totalDocuments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {report?.summary?.newDocuments || 0} new this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Storage Used
              </Typography>
              <Typography variant="h4">
                {report?.summary?.storageUsed || '0 GB'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {report?.summary?.storageLimit || '0 GB'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h4">
                {report?.summary?.totalViews || 0}
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
                Shared Documents
              </Typography>
              <Typography variant="h4">
                {report?.summary?.sharedDocuments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {report?.summary?.activeShares || 0} active shares
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
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="doc">Word</MenuItem>
                <MenuItem value="xls">Excel</MenuItem>
                <MenuItem value="img">Image</MenuItem>
              </Select>
            </FormControl>
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
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Activity Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Activity Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report?.activityTrends || []}>
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
                  dataKey="uploads"
                  name="Uploads"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  name="Views"
                  stroke="#2e7d32"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="shares"
                  name="Shares"
                  stroke="#ed6c02"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Types Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report?.typeDistribution || []}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#1976d2"
                  label
                >
                  {report?.typeDistribution?.map((entry, index) => (
                    <Cell key={index} fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Report Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Shares</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(report?.documents || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DocumentIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2">
                        {doc.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={doc.type}
                    size="small"
                    icon={<CategoryIcon />}
                  />
                </TableCell>
                <TableCell>{doc.owner}</TableCell>
                <TableCell>{doc.department}</TableCell>
                <TableCell>{doc.size}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ViewIcon fontSize="small" />
                    {doc.views}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ShareIcon fontSize="small" />
                    {doc.shares}
                  </Box>
                </TableCell>
                <TableCell>
                  {format(new Date(doc.lastModified), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={doc.status}
                    color={doc.status === 'active' ? 'success' : 'default'}
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
          count={report?.documents?.length || 0}
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

export default DocumentReport;
