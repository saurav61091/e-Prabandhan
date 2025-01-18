import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  ContentCopy as CloneIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useFormik } from 'formik';
import { workflowTemplateSchema } from '../../../validation/workflowSchemas';
import FormError from '../../common/FormError';
import ErrorAlert from '../../common/ErrorAlert';

const StepTypeConfig = {
  APPROVAL: {
    label: 'Approval',
    fields: ['approvers', 'deadline', 'reminderFrequency']
  },
  REVIEW: {
    label: 'Review',
    fields: ['reviewers', 'deadline']
  },
  NOTIFICATION: {
    label: 'Notification',
    fields: ['recipients', 'template']
  },
  TASK: {
    label: 'Task',
    fields: ['assignees', 'deadline', 'checklist']
  }
};

const WorkflowTemplateBuilder = ({
  template,
  onSave,
  onCancel
}) => {
  const dispatch = useDispatch();
  const [configDialogOpen, setConfigDialogOpen] = React.useState(false);
  const [selectedStep, setSelectedStep] = React.useState(null);
  const departments = useSelector(state => state.department.departments);
  const users = useSelector(state => state.user.users);
  const { error } = useSelector(state => state.workflow);

  const formik = useFormik({
    initialValues: template || {
      name: '',
      description: '',
      department: '',
      isActive: true,
      steps: [],
      sla: {
        totalDuration: 72,
        stepDeadlines: {}
      },
      notifications: {
        onStart: true,
        onComplete: true,
        onStepComplete: true,
        reminderFrequency: 24
      }
    },
    validationSchema: workflowTemplateSchema,
    onSubmit: async (values) => {
      try {
        await onSave(values);
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleAddStep = (type) => {
    const newStep = {
      id: Date.now().toString(),
      type,
      name: '',
      description: '',
      config: {}
    };

    formik.setFieldValue('steps', [...formik.values.steps, newStep]);
  };

  const handleRemoveStep = (index) => {
    const newSteps = [...formik.values.steps];
    newSteps.splice(index, 1);
    formik.setFieldValue('steps', newSteps);
  };

  const handleMoveStep = (index, direction) => {
    const newSteps = [...formik.values.steps];
    const step = newSteps[index];
    newSteps.splice(index, 1);
    newSteps.splice(index + direction, 0, step);
    formik.setFieldValue('steps', newSteps);
  };

  const handleCloneStep = (index) => {
    const stepToClone = formik.values.steps[index];
    const clonedStep = {
      ...stepToClone,
      id: Date.now().toString(),
      name: `${stepToClone.name} (Copy)`
    };
    const newSteps = [...formik.values.steps];
    newSteps.splice(index + 1, 0, clonedStep);
    formik.setFieldValue('steps', newSteps);
  };

  const handleStepConfig = (step) => {
    setSelectedStep(step);
    setConfigDialogOpen(true);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const steps = Array.from(formik.values.steps);
    const [reorderedStep] = steps.splice(result.source.index, 1);
    steps.splice(result.destination.index, 0, reorderedStep);

    formik.setFieldValue('steps', steps);
  };

  const renderStepConfig = () => {
    if (!selectedStep) return null;

    const fields = StepTypeConfig[selectedStep.type].fields;

    return (
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Configure {StepTypeConfig[selectedStep.type].label} Step
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {fields.includes('approvers') && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Approvers</InputLabel>
                  <Select
                    multiple
                    value={selectedStep.config.approvers || []}
                    onChange={(e) => {
                      const newSteps = formik.values.steps.map(step =>
                        step.id === selectedStep.id
                          ? { ...step, config: { ...step.config, approvers: e.target.value } }
                          : step
                      );
                      formik.setFieldValue('steps', newSteps);
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={users.find(u => u.id === value)?.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {fields.includes('deadline') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Deadline (hours)"
                  type="number"
                  value={selectedStep.config.deadline || ''}
                  onChange={(e) => {
                    const newSteps = formik.values.steps.map(step =>
                      step.id === selectedStep.id
                        ? { ...step, config: { ...step.config, deadline: e.target.value } }
                        : step
                    );
                    formik.setFieldValue('steps', newSteps);
                  }}
                />
              </Grid>
            )}

            {fields.includes('reminderFrequency') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reminder Frequency (hours)"
                  type="number"
                  value={selectedStep.config.reminderFrequency || ''}
                  onChange={(e) => {
                    const newSteps = formik.values.steps.map(step =>
                      step.id === selectedStep.id
                        ? { ...step, config: { ...step.config, reminderFrequency: e.target.value } }
                        : step
                    );
                    formik.setFieldValue('steps', newSteps);
                  }}
                />
              </Grid>
            )}

            {fields.includes('checklist') && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Checklist Items
                </Typography>
                {selectedStep.config.checklist?.map((item, index) => (
                  <Box key={index} display="flex" gap={1} mb={1}>
                    <TextField
                      fullWidth
                      size="small"
                      value={item}
                      onChange={(e) => {
                        const newChecklist = [...selectedStep.config.checklist];
                        newChecklist[index] = e.target.value;
                        const newSteps = formik.values.steps.map(step =>
                          step.id === selectedStep.id
                            ? { ...step, config: { ...step.config, checklist: newChecklist } }
                            : step
                        );
                        formik.setFieldValue('steps', newSteps);
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newChecklist = selectedStep.config.checklist.filter((_, i) => i !== index);
                        const newSteps = formik.values.steps.map(step =>
                          step.id === selectedStep.id
                            ? { ...step, config: { ...step.config, checklist: newChecklist } }
                            : step
                        );
                        formik.setFieldValue('steps', newSteps);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const newChecklist = [...(selectedStep.config.checklist || []), ''];
                    const newSteps = formik.values.steps.map(step =>
                      step.id === selectedStep.id
                        ? { ...step, config: { ...step.config, checklist: newChecklist } }
                        : step
                    );
                    formik.setFieldValue('steps', newSteps);
                  }}
                >
                  Add Item
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Template Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Template Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                id="department"
                name="department"
                value={formik.values.department}
                onChange={formik.handleChange}
                error={formik.touched.department && Boolean(formik.errors.department)}
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
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Workflow Steps
          </Typography>
          <Box>
            {Object.keys(StepTypeConfig).map((type) => (
              <Button
                key={type}
                startIcon={<AddIcon />}
                onClick={() => handleAddStep(type)}
                sx={{ mr: 1 }}
              >
                Add {StepTypeConfig[type].label}
              </Button>
            ))}
          </Box>
        </Box>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {formik.values.steps.map((step, index) => (
                  <Draggable
                    key={step.id}
                    draggableId={step.id}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{ mb: 2 }}
                      >
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Step Name"
                                value={step.name}
                                onChange={(e) => {
                                  const newSteps = [...formik.values.steps];
                                  newSteps[index].name = e.target.value;
                                  formik.setFieldValue('steps', newSteps);
                                }}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Box display="flex" justifyContent="flex-end" gap={1}>
                                <Tooltip title="Configure Step">
                                  <IconButton
                                    onClick={() => handleStepConfig(step)}
                                    size="small"
                                  >
                                    <SettingsIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Move Up">
                                  <IconButton
                                    onClick={() => handleMoveStep(index, -1)}
                                    disabled={index === 0}
                                    size="small"
                                  >
                                    <UpIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Move Down">
                                  <IconButton
                                    onClick={() => handleMoveStep(index, 1)}
                                    disabled={index === formik.values.steps.length - 1}
                                    size="small"
                                  >
                                    <DownIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Clone Step">
                                  <IconButton
                                    onClick={() => handleCloneStep(index)}
                                    size="small"
                                  >
                                    <CloneIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove Step">
                                  <IconButton
                                    onClick={() => handleRemoveStep(index)}
                                    size="small"
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={2}
                                value={step.description}
                                onChange={(e) => {
                                  const newSteps = [...formik.values.steps];
                                  newSteps[index].description = e.target.value;
                                  formik.setFieldValue('steps', newSteps);
                                }}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Save Template
        </Button>
      </Box>

      {renderStepConfig()}
    </Box>
  );
};

export default WorkflowTemplateBuilder;
