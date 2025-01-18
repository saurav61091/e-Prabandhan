import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as ViewIcon,
  Assignment as ReassignIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { format, differenceInDays } from 'date-fns';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#4caf50', '#ff9800', '#f44336'];

const SLADashboard = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [overdueSteps, setOverdueSteps] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [reassignReason, setReassignReason] = useState('');

  useEffect(() => {
    fetchData();
    fetchUsers();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, overdueResponse, upcomingResponse] = await Promise.all([
        axios.get('/api/workflow/sla/stats'),
        axios.get('/api/workflow/sla/overdue'),
        axios.get('/api/workflow/sla/upcoming')
      ]);

      setStats(statsResponse.data);
      setOverdueSteps(overdueResponse.data);
      setUpcomingDeadlines(upcomingResponse.data);
    } catch (error) {
      enqueueSnackbar('Error fetching SLA data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching users', { variant: 'error' });
    }
  };

  const handleReassign = async () => {
    try {
      await axios.post(`/api/workflow/steps/${selectedStep.id}/reassign`, {
        assignTo: {
          type: 'user',
          value: selectedUsers
        },
        reason: reassignReason
      });

      enqueueSnackbar('Step reassigned successfully', { variant: 'success' });
      setReassignDialogOpen(false);
      setSelectedStep(null);
      setSelectedUsers([]);
      setReassignReason('');
      fetchData();
    } catch (error) {
      enqueueSnackbar('Error reassigning step', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const pieChartData = [
    { name: 'Within SLA', value: stats.withinSLA },
    { name: 'At Risk', value: stats.atRisk },
    { name: 'Breached', value: stats.breached }
  ];

  const departmentData = Object.entries(stats.departmentStats).map(([dept, values]) => ({
    department: dept,
    withinSLA: values.withinSLA,
    atRisk: values.atRisk,
    breached: values.breached
  }));

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        SLA Monitoring Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall SLA Status
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      label
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department-wise SLA Performance
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="withinSLA" name="Within SLA" fill="#4caf50" stackId="a" />
                    <Bar dataKey="atRisk" name="At Risk" fill="#ff9800" stackId="a" />
                    <Bar dataKey="breached" name="Breached" fill="#f44336" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Overdue Steps
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Step</TableCell>
                      <TableCell>Workflow</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Days Overdue</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {overdueSteps.map((step) => (
                      <TableRow
                        key={step.id}
                        sx={{ backgroundColor: 'error.lighter' }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <ErrorIcon color="error" fontSize="small" />
                            <div>
                              <Typography variant="subtitle2">
                                {step.metadata.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {step.type}
                              </Typography>
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell>{step.workflow.template.name}</TableCell>
                        <TableCell>
                          {step.assignedUsers.map((user) => user.name).join(', ')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(step.deadline), 'PPp')}
                        </TableCell>
                        <TableCell>
                          {differenceInDays(new Date(), new Date(step.deadline))} days
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Workflow">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/workflow/${step.workflow.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reassign">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedStep(step);
                                setReassignDialogOpen(true);
                              }}
                            >
                              <ReassignIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {overdueSteps.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No overdue steps
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Upcoming Deadlines
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Step</TableCell>
                      <TableCell>Workflow</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Days Remaining</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingDeadlines.map((step) => (
                      <TableRow
                        key={step.id}
                        sx={{
                          backgroundColor:
                            differenceInDays(new Date(step.deadline), new Date()) <= 2
                              ? 'warning.lighter'
                              : undefined
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {differenceInDays(new Date(step.deadline), new Date()) <= 2 && (
                              <WarningIcon color="warning" fontSize="small" />
                            )}
                            <div>
                              <Typography variant="subtitle2">
                                {step.metadata.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {step.type}
                              </Typography>
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell>{step.workflow.template.name}</TableCell>
                        <TableCell>
                          {step.assignedUsers.map((user) => user.name).join(', ')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(step.deadline), 'PPp')}
                        </TableCell>
                        <TableCell>
                          {differenceInDays(new Date(step.deadline), new Date())} days
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Workflow">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/workflow/${step.workflow.id}`)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {upcomingDeadlines.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No upcoming deadlines
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={reassignDialogOpen}
        onClose={() => setReassignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reassign Step: {selectedStep?.metadata.name}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              multiple
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              label="Assign To"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Reassignment"
            value={reassignReason}
            onChange={(e) => setReassignReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReassignDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleReassign}
            disabled={selectedUsers.length === 0 || !reassignReason}
          >
            Reassign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SLADashboard;
