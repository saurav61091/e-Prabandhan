import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/tasks?${params.toString()}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/tasks/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${taskId}`);
        fetchTasks();
        fetchStats();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'success'
    };
    return colors[priority] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Stats Section */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">{stats.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Due Soon
              </Typography>
              <Typography variant="h4">{stats.dueSoon || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Priority
              </Typography>
              <Typography variant="h4">{stats.highPriority || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Priority"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Tasks List */}
      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {task.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={task.status}
                        color={getStatusColor(task.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Due: ${format(new Date(task.dueDate), 'MMM dd, yyyy')}`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedTask(task);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(task.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Task Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ position: 'fixed', bottom: 20, right: 20 }}
        onClick={() => {
          setSelectedTask(null);
          setOpenDialog(true);
        }}
      >
        Add Task
      </Button>

      {/* Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTask ? 'Edit Task' : 'New Task'}
        </DialogTitle>
        <DialogContent>
          {/* Task form will be implemented in TaskForm component */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            {selectedTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;
