import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  Assessment,
  DateRange,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, subDays } from 'date-fns';

const WorkflowMetricsDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    completedWorkflows: 0,
    averageCompletionTime: 0,
  });

  const [chartData, setChartData] = useState([]);
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
      const response = await axios.get('/api/workflow-metrics/dashboard', {
        params: {
          startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
          endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
          templateId: selectedTemplate !== 'all' ? selectedTemplate : undefined
        }
      });
      setMetrics({
        totalWorkflows: response.data.overview.totalWorkflows,
        activeWorkflows: response.data.overview.activeWorkflows,
        completedWorkflows: response.data.overview.completedWorkflows,
        averageCompletionTime: response.data.performance.averageWorkflowDuration,
      });
      setChartData(Object.entries(response.data.performance.completionRateByTemplate).map(([id, rate]) => ({
        name: id,
        workflows: Math.round(rate)
      })));
    } catch (error) {
      console.error('Error fetching metrics:', error);
      enqueueSnackbar('Failed to fetch metrics', { variant: 'error' });
    }
  };

  const MetricCard = ({ title, value, icon: Icon }) => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon sx={{ mr: 1 }} />
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Typography variant="h4">{value}</Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Workflow Metrics
      </Typography>

      <Box sx={{ mb: 3 }}>
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
            label="Template"
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <MenuItem value="all">All Templates</MenuItem>
            {/* Add template options dynamically */}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Workflows"
            value={metrics.totalWorkflows}
            icon={Timeline}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Workflows"
            value={metrics.activeWorkflows}
            icon={TrendingUp}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completed Workflows"
            value={metrics.completedWorkflows}
            icon={Assessment}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg. Completion Time (days)"
            value={metrics.averageCompletionTime}
            icon={DateRange}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Activity
            </Typography>
            <Box sx={{ height: 300 }}>
              <LineChart
                width={800}
                height={300}
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="workflows"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WorkflowMetricsDashboard;
