import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const WorkflowMetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchMetrics();
  }, [dateRange, selectedTemplate]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/workflow-metrics/dashboard', {
        params: {
          startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
          endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
          templateId: selectedTemplate !== 'all' ? selectedTemplate : undefined
        }
      });
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      enqueueSnackbar('Failed to fetch metrics', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Failed to load metrics
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>
          Workflow Metrics Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Template</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              label="Template"
            >
              <MenuItem value="all">All Templates</MenuItem>
              {/* Add template options dynamically */}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Workflows
              </Typography>
              <Typography variant="h4">
                {metrics.overview.totalWorkflows}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Workflows
              </Typography>
              <Typography variant="h4">
                {metrics.overview.completedWorkflows}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Workflows
              </Typography>
              <Typography variant="h4">
                {metrics.overview.activeWorkflows}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                SLA Breaches
              </Typography>
              <Typography variant="h4" color="error">
                {metrics.slaCompliance.totalBreaches}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Completion Rate
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(metrics.performance.completionRateByTemplate).map(([id, rate]) => ({
                template: id,
                rate: Math.round(rate)
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="template" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="#8884d8" name="Completion Rate" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              SLA Breaches by Department
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(metrics.slaCompliance.breachesByDepartment).map(([dept, count]) => ({
                    name: dept,
                    value: count
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#82ca9d"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Duration Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { name: 'Workflows', value: metrics.performance.averageWorkflowDuration },
                { name: 'Tasks', value: metrics.performance.averageTaskDuration }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit=" hrs" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Duration" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkflowMetricsDashboard;
