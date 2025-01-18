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
  Chip,
  Tooltip
} from '@mui/material';
import {
  Event as CalendarIcon,
  Settings as SettingsIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Check as VerifyIcon,
  Warning as WarningIcon,
  Google as GoogleIcon,
  Outlook as OutlookIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { calendarSettingsSchema } from '../../validation/integrationSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const CalendarIntegration = () => {
  const dispatch = useDispatch();
  const [syncDialogOpen, setSyncDialogOpen] = React.useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const { settings, loading, error } = useSelector(state => state.calendarIntegration);

  const formik = useFormik({
    initialValues: {
      provider: settings?.provider || 'google',
      calendarId: settings?.calendarId || '',
      syncFrequency: settings?.syncFrequency || 'hourly',
      eventTypes: settings?.eventTypes || {
        tasks: true,
        meetings: true,
        deadlines: true,
        reminders: true
      },
      notifications: settings?.notifications || {
        email: true,
        push: true,
        beforeMinutes: 15
      }
    },
    validationSchema: calendarSettingsSchema,
    onSubmit: async (values) => {
      try {
        // await dispatch(updateCalendarSettings(values)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleConnect = async (provider) => {
    try {
      // await dispatch(connectCalendar(provider)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleSync = async () => {
    try {
      // await dispatch(syncCalendar()).unwrap();
      setSyncDialogOpen(false);
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
          Calendar Integration
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={() => setSyncDialogOpen(true)}
          >
            Sync Now
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
        {/* Connection Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Connection Status
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <GoogleIcon color={settings?.connections?.google ? 'primary' : 'disabled'} />
                      <Box flex={1}>
                        <Typography variant="subtitle1">
                          Google Calendar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {settings?.connections?.google ? 'Connected' : 'Not Connected'}
                        </Typography>
                      </Box>
                      <Button
                        variant={settings?.connections?.google ? 'outlined' : 'contained'}
                        onClick={() => handleConnect('google')}
                      >
                        {settings?.connections?.google ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <OutlookIcon color={settings?.connections?.outlook ? 'primary' : 'disabled'} />
                      <Box flex={1}>
                        <Typography variant="subtitle1">
                          Outlook Calendar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {settings?.connections?.outlook ? 'Connected' : 'Not Connected'}
                        </Typography>
                      </Box>
                      <Button
                        variant={settings?.connections?.outlook ? 'outlined' : 'contained'}
                        onClick={() => handleConnect('outlook')}
                      >
                        {settings?.connections?.outlook ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Calendar Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Calendar Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Default Provider</InputLabel>
                  <Select
                    id="provider"
                    name="provider"
                    value={formik.values.provider}
                    onChange={formik.handleChange}
                    error={formik.touched.provider && Boolean(formik.errors.provider)}
                    label="Default Provider"
                  >
                    <MenuItem value="google">Google Calendar</MenuItem>
                    <MenuItem value="outlook">Outlook Calendar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="calendarId"
                  name="calendarId"
                  label="Calendar ID"
                  value={formik.values.calendarId}
                  onChange={formik.handleChange}
                  error={formik.touched.calendarId && Boolean(formik.errors.calendarId)}
                  helperText={formik.touched.calendarId && formik.errors.calendarId}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Sync Frequency</InputLabel>
                  <Select
                    id="syncFrequency"
                    name="syncFrequency"
                    value={formik.values.syncFrequency}
                    onChange={formik.handleChange}
                    error={formik.touched.syncFrequency && Boolean(formik.errors.syncFrequency)}
                    label="Sync Frequency"
                  >
                    <MenuItem value="realtime">Real-time</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Event Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event Settings
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    id="eventTypes.tasks"
                    name="eventTypes.tasks"
                    checked={formik.values.eventTypes.tasks}
                    onChange={formik.handleChange}
                  />
                }
                label="Task Events"
              />
              <FormControlLabel
                control={
                  <Switch
                    id="eventTypes.meetings"
                    name="eventTypes.meetings"
                    checked={formik.values.eventTypes.meetings}
                    onChange={formik.handleChange}
                  />
                }
                label="Meeting Events"
              />
              <FormControlLabel
                control={
                  <Switch
                    id="eventTypes.deadlines"
                    name="eventTypes.deadlines"
                    checked={formik.values.eventTypes.deadlines}
                    onChange={formik.handleChange}
                  />
                }
                label="Deadline Events"
              />
              <FormControlLabel
                control={
                  <Switch
                    id="eventTypes.reminders"
                    name="eventTypes.reminders"
                    checked={formik.values.eventTypes.reminders}
                    onChange={formik.handleChange}
                  />
                }
                label="Reminder Events"
              />
            </FormGroup>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      id="notifications.email"
                      name="notifications.email"
                      checked={formik.values.notifications.email}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      id="notifications.push"
                      name="notifications.push"
                      checked={formik.values.notifications.push}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  id="notifications.beforeMinutes"
                  name="notifications.beforeMinutes"
                  label="Reminder Minutes Before Event"
                  value={formik.values.notifications.beforeMinutes}
                  onChange={formik.handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Event Categories */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Event Categories
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setCategoryDialogOpen(true)}
              >
                Add Category
              </Button>
            </Box>
            <List>
              {(settings?.categories || []).map((category) => (
                <ListItem
                  key={category.id}
                  secondaryAction={
                    <Box>
                      <IconButton onClick={() => handleEditCategory(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteCategory(category.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <CategoryIcon style={{ color: category.color }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={category.name}
                    secondary={category.description}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Sync Dialog */}
      <Dialog
        open={syncDialogOpen}
        onClose={() => setSyncDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Sync Calendar
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            This will sync all events between the selected calendars.
          </Alert>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Sync Direction</InputLabel>
            <Select
              value={settings?.syncDirection || 'both'}
              label="Sync Direction"
              // Add necessary handlers
            >
              <MenuItem value="both">Two-way Sync</MenuItem>
              <MenuItem value="import">Import Only</MenuItem>
              <MenuItem value="export">Export Only</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={handleSync}
          >
            Start Sync
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {settings?.editingCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
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
                type="color"
                label="Color"
                // Add necessary handlers
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={settings?.editingCategory ? <EditIcon /> : <AddIcon />}
            onClick={() => handleSaveCategory(/* category data */)}
          >
            {settings?.editingCategory ? 'Update' : 'Add'} Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarIntegration;
