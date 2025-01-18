import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const WorkflowForm = ({ fileId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: [{ name: '', approver: '', description: '' }]
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error loading users');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { name: '', approver: '', description: '' }]
    }));
  };

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/workflows', {
        ...formData,
        fileId
      });
      onSubmit(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating workflow');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Workflow Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Approval Steps
          </Typography>

          {formData.steps.map((step, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Step Name"
                      value={step.name}
                      onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Approver</InputLabel>
                      <Select
                        value={step.approver}
                        onChange={(e) => handleStepChange(index, 'approver', e.target.value)}
                        label="Approver"
                      >
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Step Description"
                      value={step.description}
                      onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      color="error"
                      onClick={() => removeStep(index)}
                      disabled={formData.steps.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addStep}
            sx={{ mt: 1 }}
          >
            Add Step
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Create Workflow
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkflowForm;
