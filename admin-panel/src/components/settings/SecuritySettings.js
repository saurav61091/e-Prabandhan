import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Slider,
  Divider,
  Alert,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  Timer as TimerIcon,
  Shield as ShieldIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';

const SecuritySettings = () => {
  const [loading, setLoading] = React.useState(false);
  const [settings, setSettings] = React.useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiry: 90,
      preventReuse: 5,
    },
    sessionPolicy: {
      sessionTimeout: 30,
      maxConcurrentSessions: 2,
      enforceDeviceLock: true,
      rememberMe: true,
    },
    mfaSettings: {
      enabled: false,
      method: 'email', // 'email', 'authenticator', 'sms'
      enforceForAdmins: true,
      enforceForUsers: false,
    },
    ipSecurity: {
      whitelistEnabled: false,
      whitelist: [],
      blacklistEnabled: true,
      blacklist: [],
      maxLoginAttempts: 5,
      lockoutDuration: 30,
    },
    auditSettings: {
      logLogins: true,
      logActions: true,
      logDataAccess: true,
      retentionPeriod: 365,
    },
  });

  const handlePasswordPolicyChange = (field, value) => {
    setSettings({
      ...settings,
      passwordPolicy: {
        ...settings.passwordPolicy,
        [field]: value,
      },
    });
  };

  const handleSessionPolicyChange = (field, value) => {
    setSettings({
      ...settings,
      sessionPolicy: {
        ...settings.sessionPolicy,
        [field]: value,
      },
    });
  };

  const handleMfaSettingsChange = (field, value) => {
    setSettings({
      ...settings,
      mfaSettings: {
        ...settings.mfaSettings,
        [field]: value,
      },
    });
  };

  const handleIpSecurityChange = (field, value) => {
    setSettings({
      ...settings,
      ipSecurity: {
        ...settings.ipSecurity,
        [field]: value,
      },
    });
  };

  const handleAuditSettingsChange = (field, value) => {
    setSettings({
      ...settings,
      auditSettings: {
        ...settings.auditSettings,
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Security Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Password Policy */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LockIcon color="primary" />
                  <Typography variant="h6">
                    Password Policy
                  </Typography>
                </Box>

                <TextField
                  label="Minimum Password Length"
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => handlePasswordPolicyChange('minLength', e.target.value)}
                  fullWidth
                />

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.passwordPolicy.requireUppercase}
                        onChange={(e) =>
                          handlePasswordPolicyChange('requireUppercase', e.target.checked)
                        }
                      />
                    }
                    label="Require Uppercase Letters"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.passwordPolicy.requireLowercase}
                        onChange={(e) =>
                          handlePasswordPolicyChange('requireLowercase', e.target.checked)
                        }
                      />
                    }
                    label="Require Lowercase Letters"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.passwordPolicy.requireNumbers}
                        onChange={(e) =>
                          handlePasswordPolicyChange('requireNumbers', e.target.checked)
                        }
                      />
                    }
                    label="Require Numbers"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.passwordPolicy.requireSpecialChars}
                        onChange={(e) =>
                          handlePasswordPolicyChange('requireSpecialChars', e.target.checked)
                        }
                      />
                    }
                    label="Require Special Characters"
                  />
                </FormGroup>

                <TextField
                  label="Password Expiry (days)"
                  type="number"
                  value={settings.passwordPolicy.passwordExpiry}
                  onChange={(e) =>
                    handlePasswordPolicyChange('passwordExpiry', e.target.value)
                  }
                  fullWidth
                />

                <TextField
                  label="Prevent Password Reuse (last N passwords)"
                  type="number"
                  value={settings.passwordPolicy.preventReuse}
                  onChange={(e) =>
                    handlePasswordPolicyChange('preventReuse', e.target.value)
                  }
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Session Policy */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TimerIcon color="primary" />
                  <Typography variant="h6">
                    Session Policy
                  </Typography>
                </Box>

                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.sessionPolicy.sessionTimeout}
                  onChange={(e) =>
                    handleSessionPolicyChange('sessionTimeout', e.target.value)
                  }
                  fullWidth
                />

                <TextField
                  label="Max Concurrent Sessions"
                  type="number"
                  value={settings.sessionPolicy.maxConcurrentSessions}
                  onChange={(e) =>
                    handleSessionPolicyChange('maxConcurrentSessions', e.target.value)
                  }
                  fullWidth
                />

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sessionPolicy.enforceDeviceLock}
                        onChange={(e) =>
                          handleSessionPolicyChange('enforceDeviceLock', e.target.checked)
                        }
                      />
                    }
                    label="Enforce Device Lock"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sessionPolicy.rememberMe}
                        onChange={(e) =>
                          handleSessionPolicyChange('rememberMe', e.target.checked)
                        }
                      />
                    }
                    label="Allow Remember Me"
                  />
                </FormGroup>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* MFA Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <VpnKeyIcon color="primary" />
                  <Typography variant="h6">
                    Multi-Factor Authentication
                  </Typography>
                </Box>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.mfaSettings.enabled}
                        onChange={(e) =>
                          handleMfaSettingsChange('enabled', e.target.checked)
                        }
                      />
                    }
                    label="Enable MFA"
                  />
                </FormGroup>

                <FormControl fullWidth>
                  <InputLabel>MFA Method</InputLabel>
                  <Select
                    value={settings.mfaSettings.method}
                    onChange={(e) =>
                      handleMfaSettingsChange('method', e.target.value)
                    }
                    label="MFA Method"
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="authenticator">Authenticator App</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                  </Select>
                </FormControl>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.mfaSettings.enforceForAdmins}
                        onChange={(e) =>
                          handleMfaSettingsChange('enforceForAdmins', e.target.checked)
                        }
                      />
                    }
                    label="Enforce for Administrators"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.mfaSettings.enforceForUsers}
                        onChange={(e) =>
                          handleMfaSettingsChange('enforceForUsers', e.target.checked)
                        }
                      />
                    }
                    label="Enforce for Users"
                  />
                </FormGroup>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* IP Security */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ShieldIcon color="primary" />
                  <Typography variant="h6">
                    IP Security
                  </Typography>
                </Box>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.ipSecurity.whitelistEnabled}
                        onChange={(e) =>
                          handleIpSecurityChange('whitelistEnabled', e.target.checked)
                        }
                      />
                    }
                    label="Enable IP Whitelist"
                  />
                </FormGroup>

                <TextField
                  label="IP Whitelist"
                  multiline
                  rows={4}
                  value={settings.ipSecurity.whitelist.join('\n')}
                  onChange={(e) =>
                    handleIpSecurityChange('whitelist', e.target.value.split('\n'))
                  }
                  helperText="Enter one IP address per line"
                  fullWidth
                />

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.ipSecurity.blacklistEnabled}
                        onChange={(e) =>
                          handleIpSecurityChange('blacklistEnabled', e.target.checked)
                        }
                      />
                    }
                    label="Enable IP Blacklist"
                  />
                </FormGroup>

                <TextField
                  label="IP Blacklist"
                  multiline
                  rows={4}
                  value={settings.ipSecurity.blacklist.join('\n')}
                  onChange={(e) =>
                    handleIpSecurityChange('blacklist', e.target.value.split('\n'))
                  }
                  helperText="Enter one IP address per line"
                  fullWidth
                />

                <TextField
                  label="Max Login Attempts"
                  type="number"
                  value={settings.ipSecurity.maxLoginAttempts}
                  onChange={(e) =>
                    handleIpSecurityChange('maxLoginAttempts', e.target.value)
                  }
                  fullWidth
                />

                <TextField
                  label="Account Lockout Duration (minutes)"
                  type="number"
                  value={settings.ipSecurity.lockoutDuration}
                  onChange={(e) =>
                    handleIpSecurityChange('lockoutDuration', e.target.value)
                  }
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Audit Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <SecurityIcon color="primary" />
                  <Typography variant="h6">
                    Audit Settings
                  </Typography>
                </Box>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.auditSettings.logLogins}
                        onChange={(e) =>
                          handleAuditSettingsChange('logLogins', e.target.checked)
                        }
                      />
                    }
                    label="Log Login Activities"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.auditSettings.logActions}
                        onChange={(e) =>
                          handleAuditSettingsChange('logActions', e.target.checked)
                        }
                      />
                    }
                    label="Log User Actions"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.auditSettings.logDataAccess}
                        onChange={(e) =>
                          handleAuditSettingsChange('logDataAccess', e.target.checked)
                        }
                      />
                    }
                    label="Log Data Access"
                  />
                </FormGroup>

                <TextField
                  label="Log Retention Period (days)"
                  type="number"
                  value={settings.auditSettings.retentionPeriod}
                  onChange={(e) =>
                    handleAuditSettingsChange('retentionPeriod', e.target.value)
                  }
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <LoadingButton
          loading={loading}
          variant="contained"
          onClick={handleSave}
          size="large"
        >
          Save Security Settings
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default SecuritySettings;
