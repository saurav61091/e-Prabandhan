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
  Button,
  Checkbox,
  Chip,
  Avatar,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
  AssignmentLate as OverdueIcon,
  AssignmentTurnedIn as CompleteIcon,
  Flag as PriorityIcon,
  Comment as CommentIcon,
  Attachment as AttachmentIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { format, isAfter } from 'date-fns';
import { useFormik } from 'formik';
import { taskSchema } from '../../../validation/workflowSchemas';
import FormError from '../../common/FormError';
import ErrorAlert from '../../common/ErrorAlert';

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'info'
};

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onComment
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = React.useState(false);
  const [comment, setComment] = React.useState('');

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleAddComment = () => {
    onComment(task.id, comment);
    setComment('');
    setCommentDialogOpen(false);
  };

  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate));

  return (
    <Card
      sx={{
        mb: 2,
        opacity: task.status === 'completed' ? 0.7 : 1
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              checked={task.status === 'completed'}
              onChange={(e) => onStatusChange(task.id, e.target.checked ? 'completed' : 'pending')}
            />
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                }}
              >
                {task.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {task.description}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <Chip
            size="small"
            label={task.priority}
            color={priorityColors[task.priority]}
            icon={<PriorityIcon />}
          />
          {isOverdue && (
            <Chip
              size="small"
              label="Overdue"
              color="error"
              icon={<OverdueIcon />}
            />
          )}
          {task.dueDate && (
            <Typography variant="caption" color="text.secondary">
              Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </Typography>
          )}
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Box display="flex" gap={1}>
            <Avatar
              src={task.assignee?.avatar}
              alt={task.assignee?.name}
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="body2">
              {task.assignee?.name}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            {task.attachments > 0 && (
              <Tooltip title={`${task.attachments} attachments`}>
                <Box display="flex" alignItems="center">
                  <AttachmentIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {task.attachments}
                  </Typography>
                </Box>
              </Tooltip>
            )}
            {task.comments > 0 && (
              <Tooltip title={`${task.comments} comments`}>
                <Box display="flex" alignItems="center">
                  <CommentIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {task.comments}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleMenuClose();
            onEdit(task);
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            handleMenuClose();
            setCommentDialogOpen(true);
          }}>
            <ListItemIcon>
              <CommentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Comment</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            handleMenuClose();
            onDelete(task.id);
          }} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        <Dialog
          open={commentDialogOpen}
          onClose={() => setCommentDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Comment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your comment here..."
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddComment}
              variant="contained"
              disabled={!comment.trim()}
            >
              Add Comment
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const WorkflowTaskList = () => {
  const dispatch = useDispatch();
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState(null);
  const { tasks, loading, error } = useSelector(state => state.workflow);
  const users = useSelector(state => state.user.users);

  const formik = useFormik({
    initialValues: selectedTask || {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: null,
      assigneeId: '',
      status: 'pending'
    },
    validationSchema: taskSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (selectedTask) {
          // await dispatch(updateTask(values)).unwrap();
        } else {
          // await dispatch(createTask(values)).unwrap();
        }
        handleCloseDialog();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleCloseDialog = () => {
    setTaskDialogOpen(false);
    setSelectedTask(null);
    formik.resetForm();
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // await dispatch(deleteTask(taskId)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // Handle task reordering
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setTaskDialogOpen(true)}
        >
          Add Task
        </Button>
      </Box>

      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tasks.map((task, index) => (
                <Draggable
                  key={task.id}
                  draggableId={task.id}
                  index={index}
                >
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskCard
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onStatusChange={(id, status) => {
                          // dispatch(updateTaskStatus({ id, status }));
                        }}
                        onPriorityChange={(id, priority) => {
                          // dispatch(updateTaskPriority({ id, priority }));
                        }}
                        onAssigneeChange={(id, assigneeId) => {
                          // dispatch(updateTaskAssignee({ id, assigneeId }));
                        }}
                        onComment={(id, comment) => {
                          // dispatch(addTaskComment({ id, comment }));
                        }}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog
        open={taskDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedTask ? 'Edit Task' : 'Add Task'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Task Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="priority"
                  name="priority"
                  label="Priority"
                  select
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                  helperText={formik.touched.priority && formik.errors.priority}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="assigneeId"
                  name="assigneeId"
                  label="Assignee"
                  select
                  value={formik.values.assigneeId}
                  onChange={formik.handleChange}
                  error={formik.touched.assigneeId && Boolean(formik.errors.assigneeId)}
                  helperText={formik.touched.assigneeId && formik.errors.assigneeId}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="dueDate"
                  name="dueDate"
                  label="Due Date"
                  type="date"
                  value={formik.values.dueDate || ''}
                  onChange={formik.handleChange}
                  error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                  helperText={formik.touched.dueDate && formik.errors.dueDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={selectedTask ? <EditIcon /> : <AddIcon />}
            >
              {selectedTask ? 'Update' : 'Add'} Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default WorkflowTaskList;
