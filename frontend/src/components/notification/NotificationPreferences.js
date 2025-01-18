import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    taskAssignments: true,
    taskReminders: true,
    workflowApprovals: true,
    fileUpdates: true,
    dailyDigest: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/api/users/me');
      if (response.data.notificationPreferences) {
        setPreferences(response.data.notificationPreferences);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const handleChange = (event) => {
    setPreferences({
      ...preferences,
      [event.target.name]: event.target.checked
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.put('/api/notifications/preferences', {
        preferences
      });
      setSnackbar({
        open: true,
        message: 'Notification preferences updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating notification preferences',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={handleChange}
                  name="emailNotifications"
                />
              }
              label="Email Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.taskAssignments}
                  onChange={handleChange}
                  name="taskAssignments"
                  disabled={!preferences.emailNotifications}
                />
              }
              label="Task Assignments"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.taskReminders}
                  onChange={handleChange}
                  name="taskReminders"
                  disabled={!preferences.emailNotifications}
                />
              }
              label="Task Reminders"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.workflowApprovals}
                  onChange={handleChange}
                  name="workflowApprovals"
                  disabled={!preferences.emailNotifications}
                />
              }
              label="Workflow Approvals"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.fileUpdates}
                  onChange={handleChange}
                  name="fileUpdates"
                  disabled={!preferences.emailNotifications}
                />
              }
              label="File Updates"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={preferences.dailyDigest}
                  onChange={handleChange}
                  name="dailyDigest"
                  disabled={!preferences.emailNotifications}
                />
              }
              label="Daily Digest"
            />
          </FormGroup>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Save Preferences
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationPreferences;
