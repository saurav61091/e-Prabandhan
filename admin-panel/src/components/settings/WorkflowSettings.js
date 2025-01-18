import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const WorkflowSettings = () => {
  const [workflows, setWorkflows] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentWorkflow, setCurrentWorkflow] = React.useState(null);
  const [departments, setDepartments] = React.useState([
    'Finance',
    'HR',
    'IT',
    'Legal',
    'Operations',
  ]);
  const [roles, setRoles] = React.useState([
    'Director',
    'Manager',
    'Supervisor',
    'Team Lead',
    'Employee',
  ]);

  const handleAddWorkflow = () => {
    setCurrentWorkflow({
      id: Date.now(),
      name: '',
      description: '',
      department: '',
      approvers: [],
      conditions: [],
    });
    setOpenDialog(true);
  };

  const handleEditWorkflow = (workflow) => {
    setCurrentWorkflow(workflow);
    setOpenDialog(true);
  };

  const handleDeleteWorkflow = (workflowId) => {
    setWorkflows(workflows.filter((w) => w.id !== workflowId));
  };

  const handleSaveWorkflow = () => {
    if (currentWorkflow.id) {
      setWorkflows(
        workflows.map((w) =>
          w.id === currentWorkflow.id ? currentWorkflow : w
        )
      );
    } else {
      setWorkflows([...workflows, currentWorkflow]);
    }
    setOpenDialog(false);
  };

  const handleAddApprover = () => {
    setCurrentWorkflow({
      ...currentWorkflow,
      approvers: [
        ...currentWorkflow.approvers,
        { role: '', level: currentWorkflow.approvers.length + 1 },
      ],
    });
  };

  const handleRemoveApprover = (index) => {
    const newApprovers = [...currentWorkflow.approvers];
    newApprovers.splice(index, 1);
    setCurrentWorkflow({
      ...currentWorkflow,
      approvers: newApprovers.map((a, i) => ({ ...a, level: i + 1 })),
    });
  };

  const handleApproverChange = (index, field, value) => {
    const newApprovers = [...currentWorkflow.approvers];
    newApprovers[index] = { ...newApprovers[index], [field]: value };
    setCurrentWorkflow({
      ...currentWorkflow,
      approvers: newApprovers,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Workflow Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddWorkflow}
        >
          Add Workflow
        </Button>
      </Box>

      <Grid container spacing={3}>
        {workflows.map((workflow) => (
          <Grid item xs={12} key={workflow.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {workflow.name}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {workflow.description}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Department: {workflow.department}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditWorkflow(workflow)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Approval Flow
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {workflow.approvers.map((approver, index) => (
                    <React.Fragment key={index}>
                      <Chip
                        label={`${index + 1}. ${approver.role}`}
                        color="primary"
                        variant="outlined"
                      />
                      {index < workflow.approvers.length - 1 && (
                        <Typography color="text.secondary">→</Typography>
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Workflow Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentWorkflow?.id ? 'Edit Workflow' : 'Add Workflow'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Workflow Name"
              fullWidth
              value={currentWorkflow?.name || ''}
              onChange={(e) =>
                setCurrentWorkflow({ ...currentWorkflow, name: e.target.value })
              }
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={currentWorkflow?.description || ''}
              onChange={(e) =>
                setCurrentWorkflow({
                  ...currentWorkflow,
                  description: e.target.value,
                })
              }
            />

            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={currentWorkflow?.department || ''}
                onChange={(e) =>
                  setCurrentWorkflow({
                    ...currentWorkflow,
                    department: e.target.value,
                  })
                }
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">
                  Approvers
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddApprover}
                  disabled={!currentWorkflow?.department}
                >
                  Add Approver
                </Button>
              </Box>

              <Stack spacing={2}>
                {currentWorkflow?.approvers.map((approver, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      Level {approver.level}
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={approver.role}
                        onChange={(e) =>
                          handleApproverChange(index, 'role', e.target.value)
                        }
                        label="Role"
                      >
                        {roles.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveApprover(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveWorkflow}
            disabled={
              !currentWorkflow?.name ||
              !currentWorkflow?.department ||
              !currentWorkflow?.approvers.length ||
              currentWorkflow?.approvers.some((a) => !a.role)
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowSettings;
