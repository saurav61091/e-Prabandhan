import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkflows();
    fetchStats();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get('/api/workflows');
      setWorkflows(response.data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/workflows/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching workflow stats:', error);
    }
  };

  const handleApproval = async (action) => {
    try {
      await axios.put(`/api/workflows/${selectedWorkflow.id}/step`, {
        action,
        comment
      });
      
      setApprovalDialog(false);
      setComment('');
      fetchWorkflows();
      fetchStats();
    } catch (error) {
      setError(error.response?.data?.error || 'Error updating workflow');
    }
  };

  const getStepColor = (step, index, currentStep) => {
    if (index < currentStep) {
      return step.status === 'approved' ? 'success' : 'error';
    }
    if (index === currentStep) {
      return 'primary';
    }
    return 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Stats Section */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Workflows
              </Typography>
              <Typography variant="h4">{stats.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4">{stats.active || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">{stats.completed || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Approval
              </Typography>
              <Typography variant="h4">{stats.pendingApproval || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Workflows List */}
      <Grid container spacing={2}>
        {workflows.map((workflow) => (
          <Grid item xs={12} key={workflow.id}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {workflow.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {workflow.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={workflow.status}
                      color={
                        workflow.status === 'completed'
                          ? 'success'
                          : workflow.status === 'rejected'
                          ? 'error'
                          : 'primary'
                      }
                      size="small"
                    />
                    <Chip
                      label={`File: ${workflow.File?.name}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`Created: ${format(new Date(workflow.createdAt), 'MMM dd, yyyy')}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>

                <Stepper activeStep={workflow.currentStep}>
                  {workflow.steps.map((step, index) => (
                    <Step key={index}>
                      <StepLabel
                        error={step.status === 'rejected'}
                        color={getStepColor(step, index, workflow.currentStep)}
                      >
                        {step.name}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {workflow.status === 'active' &&
                  workflow.steps[workflow.currentStep]?.approver === workflow.currentUser?.id && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setApprovalDialog(true);
                        }}
                      >
                        Review
                      </Button>
                    </Box>
                  )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)}>
        <DialogTitle>Review Workflow Step</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Comment"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => handleApproval('rejected')}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApproval('approved')}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowList;
