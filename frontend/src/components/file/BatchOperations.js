import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const BatchOperations = ({ selectedFiles, onComplete, users }) => {
  const [open, setOpen] = useState(false);
  const [operation, setOperation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Move operation states
  const [toUserId, setToUserId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [instructions, setInstructions] = useState('');
  
  // Tag operation states
  const [tags, setTags] = useState([]);
  const [tagAction, setTagAction] = useState('add');
  const [newTag, setNewTag] = useState('');
  
  const { enqueueSnackbar } = useSnackbar();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setOperation('');
    setToUserId('');
    setRemarks('');
    setDueDate(null);
    setPriority('medium');
    setInstructions('');
    setTags([]);
    setTagAction('add');
    setNewTag('');
    setError(null);
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleBatchOperation = async () => {
    try {
      setLoading(true);
      setError(null);

      const fileIds = selectedFiles.map(file => file.id);

      let response;
      switch (operation) {
        case 'move':
          response = await axios.post('/api/files/batch/move', {
            fileIds,
            toUserId,
            action: 'forward',
            remarks,
            dueDate,
            priority,
            instructions
          });
          break;

        case 'delete':
          response = await axios.post('/api/files/batch/delete', {
            fileIds
          });
          break;

        case 'tags':
          response = await axios.post('/api/files/batch/tags', {
            fileIds,
            tags,
            action: tagAction
          });
          break;

        case 'confidential':
          response = await axios.post('/api/files/batch/confidential', {
            fileIds,
            isConfidential: true
          });
          break;

        default:
          throw new Error('Invalid operation');
      }

      enqueueSnackbar('Batch operation completed successfully', { variant: 'success' });
      handleClose();
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      enqueueSnackbar('Error performing batch operation', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderOperationContent = () => {
    switch (operation) {
      case 'move':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>To User</InputLabel>
              <Select
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                label="To User"
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              multiline
              rows={2}
            />
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={setDueDate}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              multiline
              rows={3}
            />
          </>
        );

      case 'tags':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Action</InputLabel>
              <Select
                value={tagAction}
                onChange={(e) => setTagAction(e.target.value)}
                label="Action"
              >
                <MenuItem value="add">Add Tags</MenuItem>
                <MenuItem value="remove">Remove Tags</MenuItem>
                <MenuItem value="set">Set Tags</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="New Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="contained" onClick={handleAddTag}>
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleOpen}
        disabled={selectedFiles.length === 0}
      >
        Batch Operations
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Batch Operations</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selected Files: {selectedFiles.length}
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Operation</InputLabel>
            <Select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              label="Operation"
            >
              <MenuItem value="move">Move Files</MenuItem>
              <MenuItem value="delete">Delete Files</MenuItem>
              <MenuItem value="tags">Manage Tags</MenuItem>
              <MenuItem value="confidential">Mark as Confidential</MenuItem>
            </Select>
          </FormControl>

          {renderOperationContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleBatchOperation}
            variant="contained"
            disabled={!operation || loading}
          >
            {loading ? 'Processing...' : 'Execute'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BatchOperations;
