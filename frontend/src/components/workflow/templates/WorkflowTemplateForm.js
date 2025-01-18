import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const STEP_TYPES = [
  { value: 'approval', label: 'Approval' },
  { value: 'review', label: 'Review' },
  { value: 'sign', label: 'Sign' },
  { value: 'route', label: 'Route' },
  { value: 'notify', label: 'Notify' },
  { value: 'condition', label: 'Condition' },
  { value: 'action', label: 'Action' }
];

const ASSIGNMENT_TYPES = [
  { value: 'user', label: 'Specific Users' },
  { value: 'role', label: 'Role' },
  { value: 'department', label: 'Department' },
  { value: 'dynamic', label: 'Dynamic' }
];

const initialStepState = {
  id: '',
  name: '',
  type: '',
  description: '',
  assignTo: {
    type: 'user',
    value: []
  },
  deadline: {
    type: 'fixed',
    value: 7
  },
  dependencies: [],
  parallel: false,
  requiredApprovals: 1,
  conditions: [],
  actions: [],
  formConfig: {},
  notifications: []
};

const WorkflowTemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    fileTypes: [],
    steps: [],
    sla: {
      warningThreshold: 2,
      autoReassign: false,
      backupAssignees: {}
    },
    active: true
  });

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [editingStepIndex, setEditingStepIndex] = useState(-1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
    fetchRoles();
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching departments', { variant: 'error' });
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

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching roles', { variant: 'error' });
    }
  };

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(`/api/workflow/templates/${id}`);
      setFormData(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching template', { variant: 'error' });
      navigate('/workflow/templates');
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSLAChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      sla: {
        ...prev.sla,
        [name]: event.target.type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleAddStep = () => {
    setCurrentStep({
      ...initialStepState,
      id: uuidv4()
    });
    setEditingStepIndex(-1);
    setStepDialogOpen(true);
  };

  const handleEditStep = (index) => {
    setCurrentStep(formData.steps[index]);
    setEditingStepIndex(index);
    setStepDialogOpen(true);
  };

  const handleStepSave = () => {
    if (!validateStep(currentStep)) return;

    setFormData((prev) => {
      const newSteps = [...prev.steps];
      if (editingStepIndex === -1) {
        newSteps.push(currentStep);
      } else {
        newSteps[editingStepIndex] = currentStep;
      }
      return {
        ...prev,
        steps: newSteps
      };
    });

    setStepDialogOpen(false);
    setCurrentStep(null);
    setEditingStepIndex(-1);
  };

  const handleDeleteStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const steps = Array.from(formData.steps);
    const [reorderedStep] = steps.splice(result.source.index, 1);
    steps.splice(result.destination.index, 0, reorderedStep);

    setFormData((prev) => ({
      ...prev,
      steps
    }));
  };

  const validateStep = (step) => {
    const stepErrors = {};
    if (!step.name) stepErrors.name = 'Name is required';
    if (!step.type) stepErrors.type = 'Type is required';
    if (!step.assignTo.type) stepErrors.assignTo = 'Assignment type is required';
    if (!step.assignTo.value || step.assignTo.value.length === 0) {
      stepErrors.assignToValue = 'Assignment value is required';
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      if (id) {
        await axios.put(`/api/workflow/templates/${id}`, formData);
        enqueueSnackbar('Template updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/workflow/templates', formData);
        enqueueSnackbar('Template created successfully', { variant: 'success' });
      }
      navigate('/workflow/templates');
    } catch (error) {
      enqueueSnackbar('Error saving template', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          {id ? 'Edit Workflow Template' : 'Create Workflow Template'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Template Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']}
                  value={formData.fileTypes}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      fileTypes: newValue
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Allowed File Types"
                      placeholder="Add file type"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Workflow Steps</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddStep}
              >
                Add Step
              </Button>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="steps">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {formData.steps.map((step, index) => (
                      <Draggable
                        key={step.id}
                        draggableId={step.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            variant="outlined"
                            sx={{ mb: 2 }}
                          >
                            <CardContent>
                              <Grid container alignItems="center" spacing={2}>
                                <Grid item {...provided.dragHandleProps}>
                                  <DragHandleIcon color="action" />
                                </Grid>
                                <Grid item xs>
                                  <Typography variant="subtitle1">
                                    {index + 1}. {step.name}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Type: {step.type}
                                  </Typography>
                                </Grid>
                                <Grid item>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditStep(index)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteStep(index)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              SLA Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Warning Threshold (days)"
                  name="warningThreshold"
                  value={formData.sla.warningThreshold}
                  onChange={handleSLAChange}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.sla.autoReassign}
                      onChange={handleSLAChange}
                      name="autoReassign"
                    />
                  }
                  label="Enable Auto-reassignment"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/workflow/templates')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            {id ? 'Update Template' : 'Create Template'}
          </Button>
        </Box>
      </form>

      <Dialog
        open={stepDialogOpen}
        onClose={() => setStepDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStepIndex === -1 ? 'Add Step' : 'Edit Step'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Step Name"
                value={currentStep?.name || ''}
                onChange={(e) =>
                  setCurrentStep((prev) => ({
                    ...prev,
                    name: e.target.value
                  }))
                }
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.type}>
                <InputLabel>Step Type</InputLabel>
                <Select
                  value={currentStep?.type || ''}
                  onChange={(e) =>
                    setCurrentStep((prev) => ({
                      ...prev,
                      type: e.target.value
                    }))
                  }
                >
                  {STEP_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && (
                  <FormHelperText>{errors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={currentStep?.description || ''}
                onChange={(e) =>
                  setCurrentStep((prev) => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.assignTo}>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={currentStep?.assignTo.type || ''}
                  onChange={(e) =>
                    setCurrentStep((prev) => ({
                      ...prev,
                      assignTo: {
                        ...prev.assignTo,
                        type: e.target.value,
                        value: []
                      }
                    }))
                  }
                >
                  {ASSIGNMENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.assignTo && (
                  <FormHelperText>{errors.assignTo}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              {currentStep?.assignTo.type === 'user' && (
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={(option) => option.name}
                  value={users.filter((user) =>
                    currentStep.assignTo.value.includes(user.id)
                  )}
                  onChange={(event, newValue) => {
                    setCurrentStep((prev) => ({
                      ...prev,
                      assignTo: {
                        ...prev.assignTo,
                        value: newValue.map((user) => user.id)
                      }
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Users"
                      error={!!errors.assignToValue}
                      helperText={errors.assignToValue}
                      required
                    />
                  )}
                />
              )}
              {currentStep?.assignTo.type === 'role' && (
                <FormControl fullWidth required error={!!errors.assignToValue}>
                  <InputLabel>Select Role</InputLabel>
                  <Select
                    value={currentStep.assignTo.value}
                    onChange={(e) =>
                      setCurrentStep((prev) => ({
                        ...prev,
                        assignTo: {
                          ...prev.assignTo,
                          value: e.target.value
                        }
                      }))
                    }
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.assignToValue && (
                    <FormHelperText>{errors.assignToValue}</FormHelperText>
                  )}
                </FormControl>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentStep?.parallel || false}
                    onChange={(e) =>
                      setCurrentStep((prev) => ({
                        ...prev,
                        parallel: e.target.checked
                      }))
                    }
                  />
                }
                label="Allow Parallel Processing"
              />
            </Grid>
            {currentStep?.parallel && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Required Approvals"
                  value={currentStep?.requiredApprovals || 1}
                  onChange={(e) =>
                    setCurrentStep((prev) => ({
                      ...prev,
                      requiredApprovals: parseInt(e.target.value)
                    }))
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStepDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStepSave} color="primary">
            Save Step
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowTemplateForm;
