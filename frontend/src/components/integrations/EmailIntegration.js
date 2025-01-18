import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Email as EmailIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Template as TemplateIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Check as VerifyIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { emailSettingsSchema } from '../../validation/integrationSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const EmailIntegration = () => {
  const dispatch = useDispatch();
  const [testDialogOpen, setTestDialogOpen] = React.useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const { settings, loading, error } = useSelector(state => state.emailIntegration);

  const formik = useFormik({
    initialValues: {
      provider: settings?.provider || 'smtp',
      host: settings?.host || '',
      port: settings?.port || '',
      username: settings?.username || '',
      password: settings?.password || '',
      encryption: settings?.encryption || 'tls',
      fromName: settings?.fromName || '',
      fromEmail: settings?.fromEmail || '',
      replyTo: settings?.replyTo || '',
      notifications: settings?.notifications || {
        tasks: true,
        documents: true,
        comments: true,
        system: true
      },
      schedule: settings?.schedule || {
        digest: true,
        digestTime: '09:00',
        digestFrequency: 'daily'
      }
    },
    validationSchema: emailSettingsSchema,
    onSubmit: async (values) => {
      try {
        // await dispatch(updateEmailSettings(values)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleTestConnection = async () => {
    try {
      // await dispatch(testEmailConnection(formik.values)).unwrap();
      setTestDialogOpen(false);
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleSaveTemplate = async (template) => {
    try {
      // await dispatch(saveEmailTemplate(template)).unwrap();
      setTemplateDialogOpen(false);
    } catch (err) {
      // Error handled by reducer
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Email Integration
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<VerifyIcon />}
            onClick={() => setTestDialogOpen(true)}
          >
            Test Connection
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={formik.handleSubmit}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      <Grid container spacing={3}>
        {/* SMTP Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              SMTP Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Provider</InputLabel>
                  <Select
                    id="provider"
                    name="provider"
                    value={formik.values.provider}
                    onChange={formik.handleChange}
                    error={formik.touched.provider && Boolean(formik.errors.provider)}
                    label="Provider"
                  >
                    <MenuItem value="smtp">Custom SMTP</MenuItem>
                    <MenuItem value="gmail">Gmail</MenuItem>
                    <MenuItem value="outlook">Outlook</MenuItem>
                    <MenuItem value="sendgrid">SendGrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="host"
                  name="host"
                  label="SMTP Host"
                  value={formik.values.host}
                  onChange={formik.handleChange}
                  error={formik.touched.host && Boolean(formik.errors.host)}
                  helperText={formik.touched.host && formik.errors.host}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="port"
                  name="port"
                  label="Port"
                  value={formik.values.port}
                  onChange={formik.handleChange}
                  error={formik.touched.port && Boolean(formik.errors.port)}
                  helperText={formik.touched.port && formik.errors.port}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Encryption</InputLabel>
                  <Select
                    id="encryption"
                    name="encryption"
                    value={formik.values.encryption}
                    onChange={formik.handleChange}
                    error={formik.touched.encryption && Boolean(formik.errors.encryption)}
                    label="Encryption"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="ssl">SSL</MenuItem>
                    <MenuItem value="tls">TLS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  id="password"
                  name="password"
                  label="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Email Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Email Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="fromName"
                  name="fromName"
                  label="From Name"
                  value={formik.values.fromName}
                  onChange={formik.handleChange}
                  error={formik.touched.fromName && Boolean(formik.errors.fromName)}
                  helperText={formik.touched.fromName && formik.errors.fromName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="fromEmail"
                  name="fromEmail"
                  label="From Email"
                  value={formik.values.fromEmail}
                  onChange={formik.handleChange}
                  error={formik.touched.fromEmail && Boolean(formik.errors.fromEmail)}
                  helperText={formik.touched.fromEmail && formik.errors.fromEmail}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="replyTo"
                  name="replyTo"
                  label="Reply-To Email"
                  value={formik.values.replyTo}
                  onChange={formik.handleChange}
                  error={formik.touched.replyTo && Boolean(formik.errors.replyTo)}
                  helperText={formik.touched.replyTo && formik.errors.replyTo}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    id="notifications.tasks"
                    name="notifications.tasks"
                    checked={formik.values.notifications.tasks}
                    onChange={formik.handleChange}
                  />
                }
                label="Task Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    id="notifications.documents"
                    name="notifications.documents"
                    checked={formik.values.notifications.documents}
                    onChange={formik.handleChange}
                  />
                }
                label="Document Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    id="notifications.comments"
                    name="notifications.comments"
                    checked={formik.values.notifications.comments}
                    onChange={formik.handleChange}
                  />
                }
                label="Comment Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    id="notifications.system"
                    name="notifications.system"
                    checked={formik.values.notifications.system}
                    onChange={formik.handleChange}
                  />
                }
                label="System Notifications"
              />
            </FormGroup>
          </Paper>
        </Grid>

        {/* Schedule Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Schedule Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      id="schedule.digest"
                      name="schedule.digest"
                      checked={formik.values.schedule.digest}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Enable Email Digest"
                />
              </Grid>
              {formik.values.schedule.digest && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      id="schedule.digestTime"
                      name="schedule.digestTime"
                      label="Digest Time"
                      value={formik.values.schedule.digestTime}
                      onChange={formik.handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Frequency</InputLabel>
                      <Select
                        id="schedule.digestFrequency"
                        name="schedule.digestFrequency"
                        value={formik.values.schedule.digestFrequency}
                        onChange={formik.handleChange}
                        label="Frequency"
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Email Templates */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Email Templates
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setTemplateDialogOpen(true)}
              >
                Add Template
              </Button>
            </Box>
            <List>
              {(settings?.templates || []).map((template) => (
                <ListItem
                  key={template.id}
                  secondaryAction={
                    <Box>
                      <IconButton onClick={() => handleEditTemplate(template)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteTemplate(template.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <TemplateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={template.name}
                    secondary={template.description}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Test Connection Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Test Email Connection
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            This will send a test email to verify your SMTP settings.
          </Alert>
          <TextField
            fullWidth
            label="Test Email Address"
            margin="normal"
            // Add necessary handlers
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleTestConnection}
          >
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {settings?.editingTemplate ? 'Edit Template' : 'Add Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                // Add necessary handlers
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                // Add necessary handlers
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                // Add necessary handlers
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                multiline
                rows={10}
                // Add necessary handlers
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={settings?.editingTemplate ? <EditIcon /> : <AddIcon />}
            onClick={() => handleSaveTemplate(/* template data */)}
          >
            {settings?.editingTemplate ? 'Update' : 'Add'} Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailIntegration;
