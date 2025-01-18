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
  Switch,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  Palette as PaletteIcon,
  Brightness4 as DarkModeIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { settingsSchema } from '../../validation/settingsSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const GeneralSettings = () => {
  const dispatch = useDispatch();
  const [logoDialogOpen, setLogoDialogOpen] = React.useState(false);
  const [logoFile, setLogoFile] = React.useState(null);
  const { settings, loading, error } = useSelector(state => state.settings);

  const formik = useFormik({
    initialValues: {
      organizationName: settings?.organizationName || '',
      language: settings?.language || 'en',
      timezone: settings?.timezone || 'UTC',
      dateFormat: settings?.dateFormat || 'MM/DD/YYYY',
      timeFormat: settings?.timeFormat || '12h',
      theme: settings?.theme || 'light',
      primaryColor: settings?.primaryColor || '#1976d2',
      darkMode: settings?.darkMode || false,
      notifications: settings?.notifications || true,
      autoSave: settings?.autoSave || true,
      sessionTimeout: settings?.sessionTimeout || 30
    },
    validationSchema: settingsSchema,
    onSubmit: async (values) => {
      try {
        // await dispatch(updateSettings(values)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      try {
        // await dispatch(updateLogo(file)).unwrap();
        setLogoDialogOpen(false);
      } catch (err) {
        // Error handled by reducer
      }
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          General Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={formik.handleSubmit}
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
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Organization
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="organizationName"
                  name="organizationName"
                  label="Organization Name"
                  value={formik.values.organizationName}
                  onChange={formik.handleChange}
                  error={formik.touched.organizationName && Boolean(formik.errors.organizationName)}
                  helperText={formik.touched.organizationName && formik.errors.organizationName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2}>
                  <img
                    src={settings.logo}
                    alt="Organization Logo"
                    style={{ height: 48, width: 'auto' }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => setLogoDialogOpen(true)}
                  >
                    Change Logo
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Localization
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    id="language"
                    name="language"
                    value={formik.values.language}
                    onChange={formik.handleChange}
                    error={formik.touched.language && Boolean(formik.errors.language)}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    id="timezone"
                    name="timezone"
                    value={formik.values.timezone}
                    onChange={formik.handleChange}
                    error={formik.touched.timezone && Boolean(formik.errors.timezone)}
                    label="Timezone"
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="EST">EST</MenuItem>
                    <MenuItem value="PST">PST</MenuItem>
                    <MenuItem value="IST">IST</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    id="dateFormat"
                    name="dateFormat"
                    value={formik.values.dateFormat}
                    onChange={formik.handleChange}
                    error={formik.touched.dateFormat && Boolean(formik.errors.dateFormat)}
                    label="Date Format"
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    id="timeFormat"
                    name="timeFormat"
                    value={formik.values.timeFormat}
                    onChange={formik.handleChange}
                    error={formik.touched.timeFormat && Boolean(formik.errors.timeFormat)}
                    label="Time Format"
                  >
                    <MenuItem value="12h">12 Hour</MenuItem>
                    <MenuItem value="24h">24 Hour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    id="theme"
                    name="theme"
                    value={formik.values.theme}
                    onChange={formik.handleChange}
                    error={formik.touched.theme && Boolean(formik.errors.theme)}
                    label="Theme"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="primaryColor"
                  name="primaryColor"
                  label="Primary Color"
                  type="color"
                  value={formik.values.primaryColor}
                  onChange={formik.handleChange}
                  error={formik.touched.primaryColor && Boolean(formik.errors.primaryColor)}
                  helperText={formik.touched.primaryColor && formik.errors.primaryColor}
                  InputProps={{
                    sx: { height: 56 }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        id="darkMode"
                        name="darkMode"
                        checked={formik.values.darkMode}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Dark Mode"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        id="notifications"
                        name="notifications"
                        checked={formik.values.notifications}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Enable Notifications"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        id="autoSave"
                        name="autoSave"
                        checked={formik.values.autoSave}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Auto Save"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Session Timeout</InputLabel>
                  <Select
                    id="sessionTimeout"
                    name="sessionTimeout"
                    value={formik.values.sessionTimeout}
                    onChange={formik.handleChange}
                    error={formik.touched.sessionTimeout && Boolean(formik.errors.sessionTimeout)}
                    label="Session Timeout"
                  >
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={logoDialogOpen}
        onClose={() => setLogoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Change Organization Logo
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 2,
              p: 3,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              textAlign: 'center'
            }}
          >
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="logo-input"
              onChange={handleLogoUpload}
            />
            <label htmlFor="logo-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
              >
                Upload Logo
              </Button>
            </label>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Recommended size: 200x200px. Max file size: 2MB
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GeneralSettings;
