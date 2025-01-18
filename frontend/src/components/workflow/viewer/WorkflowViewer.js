import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Grid,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import axios from 'axios';

const getStepIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon color="success" />;
    case 'error':
      return <CancelIcon color="error" />;
    case 'in_progress':
      return <CircularProgress size={20} />;
    case 'pending':
      return <ScheduleIcon color="action" />;
    default:
      return <WarningIcon color="warning" />;
  }
};

const getStepColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'error':
      return 'error';
    case 'in_progress':
      return 'primary';
    case 'pending':
      return 'default';
    default:
      return 'warning';
  }
};

const WorkflowViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchWorkflow();
    const interval = setInterval(fetchWorkflow, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      const response = await axios.get(`/api/workflow/${id}`);
      setWorkflow(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching workflow details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      await axios.post(`/api/workflow/steps/${selectedStep.id}/process`, {
        action,
        remarks,
        formData
      });
      
      enqueueSnackbar('Action processed successfully', { variant: 'success' });
      setActionDialogOpen(false);
      setSelectedStep(null);
      setRemarks('');
      setFormData({});
      fetchWorkflow();
    } catch (error) {
      enqueueSnackbar('Error processing action', { variant: 'error' });
    }
  };

  const handleCancel = async () => {
    try {
      await axios.post(`/api/workflow/${id}/cancel`, {
        reason: 'Cancelled by user'
      });
      enqueueSnackbar('Workflow cancelled successfully', { variant: 'success' });
      navigate(-1);
    } catch (error) {
      enqueueSnackbar('Error cancelling workflow', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!workflow) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="textSecondary">
          Workflow not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Workflow Details
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(-1)}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          {workflow.status === 'active' && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
            >
              Cancel Workflow
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {workflow.template.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {workflow.template.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip
                    label={workflow.status}
                    color={getStepColor(workflow.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Started At</Typography>
                  <Typography variant="body2">
                    {format(new Date(workflow.startedAt), 'PPpp')}
                  </Typography>
                </Grid>
                {workflow.completedAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Completed At</Typography>
                    <Typography variant="body2">
                      {format(new Date(workflow.completedAt), 'PPpp')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Workflow Steps
              </Typography>
              
              <Stepper orientation="vertical">
                {workflow.steps.map((step, index) => (
                  <Step key={step.id} active={step.status === 'in_progress'}>
                    <StepLabel
                      StepIconComponent={() => getStepIcon(step.status)}
                    >
                      <Typography variant="subtitle1">
                        {step.metadata.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {step.type}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Box mb={2}>
                        <Typography variant="body2" paragraph>
                          {step.metadata.description}
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Assigned To:
                        </Typography>
                        <Box display="flex" gap={1} mb={1}>
                          {step.assignedUsers?.map((user) => (
                            <Chip
                              key={user.id}
                              label={user.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>

                        {step.deadline && (
                          <Typography variant="body2" color="textSecondary">
                            Deadline: {format(new Date(step.deadline), 'PPp')}
                          </Typography>
                        )}
                      </Box>

                      {step.status === 'in_progress' && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            setSelectedStep(step);
                            setActionDialogOpen(true);
                          }}
                        >
                          Take Action
                        </Button>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Timeline
              </Typography>
              
              <Timeline>
                {workflow.steps.map((step) => (
                  <TimelineItem key={step.id}>
                    <TimelineOppositeContent color="textSecondary">
                      {step.startedAt && format(new Date(step.startedAt), 'PPp')}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={getStepColor(step.status)}>
                        {getStepIcon(step.status)}
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">
                        {step.metadata.name}
                      </Typography>
                      {step.decisions?.map((decision, index) => (
                        <Box key={index} mt={1}>
                          <Typography variant="body2">
                            {decision.action} by {decision.userId}
                          </Typography>
                          {decision.remarks && (
                            <Typography variant="body2" color="textSecondary">
                              "{decision.remarks}"
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Take Action: {selectedStep?.metadata.name}
        </DialogTitle>
        <DialogContent>
          {selectedStep?.metadata.formConfig && (
            <Box mb={3}>
              {Object.entries(selectedStep.metadata.formConfig).map(([field, config]) => (
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
          {selectedStep?.type === 'approval' && (
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
          {selectedStep?.type === 'review' && (
            <Button
              color="primary"
              onClick={() => handleAction('review')}
            >
              Complete Review
            </Button>
          )}
          {selectedStep?.type === 'sign' && (
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

export default WorkflowViewer;
