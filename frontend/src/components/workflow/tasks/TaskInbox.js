import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  Badge,
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Assignment as TaskIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { format, isAfter } from 'date-fns';
import axios from 'axios';

const TaskInbox = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('pending');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/workflow/tasks/my');
      setTasks(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching tasks', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      await axios.post(`/api/workflow/steps/${selectedTask.id}/process`, {
        action,
        remarks,
        formData
      });
      
      enqueueSnackbar('Task processed successfully', { variant: 'success' });
      setActionDialogOpen(false);
      setSelectedTask(null);
      setRemarks('');
      setFormData({});
      fetchTasks();
    } catch (error) {
      enqueueSnackbar('Error processing task', { variant: 'error' });
    }
  };

  const handleViewWorkflow = (workflowId) => {
    navigate(`/workflow/${workflowId}`);
  };

  const isTaskOverdue = (task) => {
    return task.deadline && isAfter(new Date(), new Date(task.deadline));
  };

  const filteredTasks = tasks.filter((task) => {
    switch (tabValue) {
      case 'pending':
        return task.status === 'pending';
      case 'in_progress':
        return task.status === 'in_progress';
      case 'completed':
        return task.status === 'completed';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          My Tasks
        </Typography>
        <Badge
          badgeContent={tasks.filter(t => t.status === 'pending').length}
          color="error"
        >
          <TaskIcon />
        </Badge>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            value="pending"
            label={
              <Badge
                badgeContent={tasks.filter(t => t.status === 'pending').length}
                color="error"
              >
                Pending
              </Badge>
            }
          />
          <Tab
            value="in_progress"
            label={
              <Badge
                badgeContent={tasks.filter(t => t.status === 'in_progress').length}
                color="primary"
              >
                In Progress
              </Badge>
            }
          />
          <Tab
            value="completed"
            label="Completed"
          />
        </Tabs>
      </Paper>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    sx={{
                      backgroundColor: isTaskOverdue(task)
                        ? 'error.lighter'
                        : undefined
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2">
                        {task.metadata.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {task.metadata.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {task.workflow.template.name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        size="small"
                        color={
                          task.status === 'completed'
                            ? 'success'
                            : task.status === 'in_progress'
                            ? 'primary'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {task.deadline ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          {format(new Date(task.deadline), 'PPp')}
                          {isTaskOverdue(task) && (
                            <Tooltip title="Overdue">
                              <WarningIcon color="error" fontSize="small" />
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        'No deadline'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Workflow">
                        <IconButton
                          size="small"
                          onClick={() => handleViewWorkflow(task.workflow.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {(task.status === 'pending' || task.status === 'in_progress') && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setSelectedTask(task);
                            setActionDialogOpen(true);
                          }}
                          sx={{ ml: 1 }}
                        >
                          Take Action
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No tasks found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Take Action: {selectedTask?.metadata.name}
        </DialogTitle>
        <DialogContent>
          {selectedTask?.metadata.formConfig && (
            <Box mb={3}>
              {Object.entries(selectedTask.metadata.formConfig).map(([field, config]) => (
                <TextField
                  key={field}
                  fullWidth
                  label={config.label}
                  type={config.type || 'text'}
                  required={config.required}
                  value={formData[field] || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field]: e.target.value
                    }))
                  }
                  sx={{ mb: 2 }}
                />
              ))}
            </Box>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Cancel
          </Button>
          {selectedTask?.type === 'approval' && (
            <>
              <Button
                color="error"
                onClick={() => handleAction('reject')}
              >
                Reject
              </Button>
              <Button
                color="success"
                onClick={() => handleAction('approve')}
              >
                Approve
              </Button>
            </>
          )}
          {selectedTask?.type === 'review' && (
            <Button
              color="primary"
              onClick={() => handleAction('review')}
            >
              Complete Review
            </Button>
          )}
          {selectedTask?.type === 'sign' && (
            <Button
              color="primary"
              onClick={() => handleAction('sign')}
            >
              Sign
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskInbox;
