import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Switch,
  Select,
  MenuItem,
  Button,
  Divider,
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
  TextField,
  LinearProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  PhoneAndroid as MobileIcon,
  Assignment as TaskIcon,
  Description as DocumentIcon,
  Comment as CommentIcon,
  Group as TeamIcon,
  Business as DepartmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { notificationSettingsSchema } from '../../validation/notificationSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const NotificationSettings = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedChannel, setSelectedChannel] = React.useState(null);
  const { settings, loading, error } = useSelector(state => state.notification);

  const formik = useFormik({
    initialValues: selectedChannel || {
      type: '',
      email: '',
      phone: '',
      enabled: true
    },
    validationSchema: notificationSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (selectedChannel) {
          // await dispatch(updateNotificationChannel(values)).unwrap();
        } else {
          // await dispatch(addNotificationChannel(values)).unwrap();
        }
        handleCloseDialog();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedChannel(null);
    formik.resetForm();
  };

  const handleToggleNotification = async (type, enabled) => {
    try {
      // await dispatch(updateNotificationSettings({ type, enabled })).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleDeleteChannel = async (channelId) => {
    try {
      // await dispatch(deleteNotificationChannel(channelId)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleSaveSettings = async () => {
    try {
      // await dispatch(saveNotificationSettings()).unwrap();
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
          Notification Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </Box>

      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Types
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.tasks.enabled}
                    onChange={(e) => handleToggleNotification('tasks', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">
                      Task Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updates about task assignments, deadlines, and completions
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.documents.enabled}
                    onChange={(e) => handleToggleNotification('documents', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">
                      Document Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updates about document uploads, shares, and reviews
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.comments.enabled}
                    onChange={(e) => handleToggleNotification('comments', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">
                      Comment Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updates about comments and mentions
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.team.enabled}
                    onChange={(e) => handleToggleNotification('team', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">
                      Team Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updates about team activities and announcements
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.department.enabled}
                    onChange={(e) => handleToggleNotification('department', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">
                      Department Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updates about department changes and policies
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Notification Channels
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
              >
                Add Channel
              </Button>
            </Box>

            <List>
              {settings.channels.map((channel) => (
                <React.Fragment key={channel.id}>
                  <ListItem>
                    <ListItemIcon>
                      {channel.type === 'email' ? <EmailIcon /> : <MobileIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={channel.type === 'email' ? channel.email : channel.phone}
                      secondary={`${channel.type} notifications`}
                    />
                    <Switch
                      edge="end"
                      checked={channel.enabled}
                      onChange={(e) => handleToggleNotification(channel.id, e.target.checked)}
                    />
                    <IconButton
                      onClick={() => {
                        setSelectedChannel(channel);
                        setDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteChannel(channel.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Schedule
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Daily Summary
                  </Typography>
                  <Select
                    value={settings.schedule.dailySummary}
                    onChange={(e) => handleToggleNotification('dailySummary', e.target.value)}
                  >
                    <MenuItem value="disabled">Disabled</MenuItem>
                    <MenuItem value="morning">Morning (9:00 AM)</MenuItem>
                    <MenuItem value="evening">Evening (5:00 PM)</MenuItem>
                  </Select>
                  <FormHelperText>
                    Receive a daily summary of all notifications
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" gutterBottom>
                    Weekly Digest
                  </Typography>
                  <Select
                    value={settings.schedule.weeklyDigest}
                    onChange={(e) => handleToggleNotification('weeklyDigest', e.target.value)}
                  >
                    <MenuItem value="disabled">Disabled</MenuItem>
                    <MenuItem value="monday">Monday</MenuItem>
                    <MenuItem value="friday">Friday</MenuItem>
                    <MenuItem value="sunday">Sunday</MenuItem>
                  </Select>
                  <FormHelperText>
                    Receive a weekly summary of important updates
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedChannel ? 'Edit Channel' : 'Add Channel'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Select
                    id="type"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="mobile">Mobile</MenuItem>
                  </Select>
                  <FormHelperText error={formik.touched.type && Boolean(formik.errors.type)}>
                    {formik.touched.type && formik.errors.type}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {formik.values.type === 'email' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
              )}

              {formik.values.type === 'mobile' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={selectedChannel ? <EditIcon /> : <AddIcon />}
            >
              {selectedChannel ? 'Update' : 'Add'} Channel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default NotificationSettings;
