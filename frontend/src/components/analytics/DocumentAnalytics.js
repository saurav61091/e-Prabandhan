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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary
} from '@mui/material';
import {
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  TrendingUp as TrendingIcon,
  Download as ExportIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Movie as VideoIcon
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

const DocumentAnalytics = () => {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = React.useState('7d');
  const { analytics, loading, error } = useSelector(state => state.analytics);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // await dispatch(fetchDocumentAnalytics(timeRange)).unwrap();
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

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <PdfIcon />;
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoIcon />;
      default:
        return <FileIcon />;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Document Analytics
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
                <DocumentIcon color="primary" />
                <Typography variant="h6">
                  Total Documents
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
                <UploadIcon color="primary" />
                <Typography variant="h6">
                  Uploads
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.totalUploads || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.uploadGrowth > 0 ? '+' : ''}{analytics?.uploadGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <ViewIcon color="primary" />
                <Typography variant="h6">
                  Views
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.totalViews || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.viewGrowth > 0 ? '+' : ''}{analytics?.viewGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <ShareIcon color="primary" />
                <Typography variant="h6">
                  Shares
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {analytics?.totalShares || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics?.shareGrowth > 0 ? '+' : ''}{analytics?.shareGrowth || 0}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Document Activity Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Activity
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

        {/* Document Types */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Types
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.documentTypes || []}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#1976d2"
                  label
                >
                  {analytics?.documentTypes?.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Storage Usage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Storage Usage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.storageUsage || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <ChartTooltip
                  formatter={(value) => [`${value} MB`, 'Storage Used']}
                />
                <Legend />
                <Bar
                  dataKey="size"
                  name="Storage Used (MB)"
                  fill="#1976d2"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Popular Documents */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Popular Documents
            </Typography>
            <List>
              {(analytics?.popularDocuments || []).map((doc) => (
                <ListItem
                  key={doc.id}
                  secondaryAction={
                    <Typography variant="body2" color="text.secondary">
                      {doc.views} views
                    </Typography>
                  }
                >
                  <ListItemIcon>
                    {getFileIcon(doc.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.name}
                    secondary={`Uploaded ${format(new Date(doc.uploadDate), 'MMM d, yyyy')}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentAnalytics;
