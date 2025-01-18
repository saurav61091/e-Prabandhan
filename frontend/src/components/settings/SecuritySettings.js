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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  VpnKey as PasswordIcon,
  Fingerprint as TwoFactorIcon,
  PhoneAndroid as MobileIcon,
  Email as EmailIcon,
  History as SessionIcon,
  Block as BlockIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as VerifyIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { securitySettingsSchema } from '../../validation/settingsSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const SecuritySettings = () => {
  const dispatch = useDispatch();
  const [verifyDialogOpen, setVerifyDialogOpen] = React.useState(false);
  const [verifyAction, setVerifyAction] = React.useState(null);
  const { settings, loading, error } = useSelector(state => state.security);

  const formik = useFormik({
    initialValues: {
      passwordPolicy: settings?.passwordPolicy || {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
      },
      twoFactor: settings?.twoFactor || {
        enabled: false,
        method: 'authenticator'
      },
      sessionPolicy: settings?.sessionPolicy || {
        timeout: 30,
        maxConcurrent: 3,
        rememberMe: true
      },
      ipWhitelist: settings?.ipWhitelist || [],
      loginAttempts: settings?.loginAttempts || {
        maxAttempts: 5,
        lockoutDuration: 15
      }
    },
    validationSchema: securitySettingsSchema,
    onSubmit: async (values) => {
      try {
        // await dispatch(updateSecuritySettings(values)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleVerifyIdentity = async (password) => {
    try {
      // await dispatch(verifyIdentity(password)).unwrap();
      if (verifyAction) {
        verifyAction();
      }
      setVerifyDialogOpen(false);
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleEnableTwoFactor = () => {
    setVerifyAction(() => async () => {
      try {
        // await dispatch(enableTwoFactor()).unwrap();
        formik.setFieldValue('twoFactor.enabled', true);
      } catch (err) {
        // Error handled by reducer
      }
    });
    setVerifyDialogOpen(true);
  };

  const handleAddIpAddress = (ip) => {
    const currentList = formik.values.ipWhitelist;
    formik.setFieldValue('ipWhitelist', [...currentList, ip]);
  };

  const handleRemoveIpAddress = (ip) => {
    const currentList = formik.values.ipWhitelist;
    formik.setFieldValue('ipWhitelist', currentList.filter(item => item !== ip));
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Security Settings
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Password Policy
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  id="passwordPolicy.minLength"
                  name="passwordPolicy.minLength"
                  label="Minimum Password Length"
                  value={formik.values.passwordPolicy.minLength}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.passwordPolicy?.minLength &&
                    Boolean(formik.errors.passwordPolicy?.minLength)
                  }
                  helperText={
                    formik.touched.passwordPolicy?.minLength &&
                    formik.errors.passwordPolicy?.minLength
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        id="passwordPolicy.requireUppercase"
                        name="passwordPolicy.requireUppercase"
                        checked={formik.values.passwordPolicy.requireUppercase}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Require Uppercase Letters"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        id="passwordPolicy.requireLowercase"
                        name="passwordPolicy.requireLowercase"
                        checked={formik.values.passwordPolicy.requireLowercase}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Require Lowercase Letters"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        id="passwordPolicy.requireNumbers"
                        name="passwordPolicy.requireNumbers"
                        checked={formik.values.passwordPolicy.requireNumbers}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Require Numbers"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        id="passwordPolicy.requireSpecialChars"
                        name="passwordPolicy.requireSpecialChars"
                        checked={formik.values.passwordPolicy.requireSpecialChars}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Require Special Characters"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  id="passwordPolicy.expiryDays"
                  name="passwordPolicy.expiryDays"
                  label="Password Expiry (Days)"
                  value={formik.values.passwordPolicy.expiryDays}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.passwordPolicy?.expiryDays &&
                    Boolean(formik.errors.passwordPolicy?.expiryDays)
                  }
                  helperText={
                    formik.touched.passwordPolicy?.expiryDays &&
                    formik.errors.passwordPolicy?.expiryDays
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Two-Factor Authentication
            </Typography>
            <Box mb={2}>
              <Alert
                severity={formik.values.twoFactor.enabled ? 'success' : 'info'}
                sx={{ mb: 2 }}
              >
                {formik.values.twoFactor.enabled
                  ? 'Two-factor authentication is enabled'
                  : 'Enable two-factor authentication to add an extra layer of security'}
              </Alert>
              {formik.values.twoFactor.enabled ? (
                <FormControl fullWidth>
                  <Select
                    id="twoFactor.method"
                    name="twoFactor.method"
                    value={formik.values.twoFactor.method}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="authenticator">Authenticator App</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<TwoFactorIcon />}
                  onClick={handleEnableTwoFactor}
                >
                  Enable Two-Factor Authentication
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Session Management
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  id="sessionPolicy.timeout"
                  name="sessionPolicy.timeout"
                  label="Session Timeout (Minutes)"
                  value={formik.values.sessionPolicy.timeout}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.sessionPolicy?.timeout &&
                    Boolean(formik.errors.sessionPolicy?.timeout)
                  }
                  helperText={
                    formik.touched.sessionPolicy?.timeout &&
                    formik.errors.sessionPolicy?.timeout
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  id="sessionPolicy.maxConcurrent"
                  name="sessionPolicy.maxConcurrent"
                  label="Max Concurrent Sessions"
                  value={formik.values.sessionPolicy.maxConcurrent}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.sessionPolicy?.maxConcurrent &&
                    Boolean(formik.errors.sessionPolicy?.maxConcurrent)
                  }
                  helperText={
                    formik.touched.sessionPolicy?.maxConcurrent &&
                    formik.errors.sessionPolicy?.maxConcurrent
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        id="sessionPolicy.rememberMe"
                        name="sessionPolicy.rememberMe"
                        checked={formik.values.sessionPolicy.rememberMe}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Allow Remember Me"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                IP Whitelist
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  // Show IP address input dialog
                }}
              >
                Add IP Address
              </Button>
            </Box>
            <List>
              {formik.values.ipWhitelist.map((ip) => (
                <ListItem
                  key={ip}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveIpAddress(ip)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={ip} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Login Protection
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  id="loginAttempts.maxAttempts"
                  name="loginAttempts.maxAttempts"
                  label="Max Login Attempts"
                  value={formik.values.loginAttempts.maxAttempts}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.loginAttempts?.maxAttempts &&
                    Boolean(formik.errors.loginAttempts?.maxAttempts)
                  }
                  helperText={
                    formik.touched.loginAttempts?.maxAttempts &&
                    formik.errors.loginAttempts?.maxAttempts
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  id="loginAttempts.lockoutDuration"
                  name="loginAttempts.lockoutDuration"
                  label="Account Lockout Duration (Minutes)"
                  value={formik.values.loginAttempts.lockoutDuration}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.loginAttempts?.lockoutDuration &&
                    Boolean(formik.errors.loginAttempts?.lockoutDuration)
                  }
                  helperText={
                    formik.touched.loginAttempts?.lockoutDuration &&
                    formik.errors.loginAttempts?.lockoutDuration
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Verify Identity
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            margin="normal"
            // Add necessary handlers
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<VerifyIcon />}
            onClick={() => {
              // Handle verification
            }}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
