import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  PlayArrow as TestIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';

const settingCategories = [
  {
    key: 'system',
    label: 'System Settings',
    fields: [
      { key: 'app_name', label: 'Application Name', type: 'string' },
      { key: 'app_url', label: 'Application URL', type: 'string' },
      { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'boolean' },
      { key: 'debug_mode', label: 'Debug Mode', type: 'boolean' },
    ]
  },
  {
    key: 'email',
    label: 'Email Settings',
    fields: [
      { key: 'smtp_host', label: 'SMTP Host', type: 'string' },
      { key: 'smtp_port', label: 'SMTP Port', type: 'number' },
      { key: 'smtp_user', label: 'SMTP Username', type: 'string' },
      { key: 'smtp_pass', label: 'SMTP Password', type: 'password', encrypted: true },
      { key: 'smtp_from', label: 'From Email', type: 'string' },
      { key: 'smtp_from_name', label: 'From Name', type: 'string' },
    ]
  },
  {
    key: 'database',
    label: 'Database Settings',
    fields: [
      { key: 'db_host', label: 'Database Host', type: 'string' },
      { key: 'db_port', label: 'Database Port', type: 'number' },
      { key: 'db_name', label: 'Database Name', type: 'string' },
      { key: 'db_user', label: 'Database Username', type: 'string' },
      { key: 'db_pass', label: 'Database Password', type: 'password', encrypted: true },
    ]
  },
  {
    key: 'security',
    label: 'Security Settings',
    fields: [
      { key: 'jwt_expiry', label: 'JWT Expiry (hours)', type: 'number' },
      { key: 'password_policy', label: 'Password Policy', type: 'json' },
      { key: 'allowed_ips', label: 'Allowed IPs', type: 'string' },
      { key: 'session_timeout', label: 'Session Timeout (minutes)', type: 'number' },
    ]
  },
  {
    key: 'backup',
    label: 'Backup Settings',
    fields: [
      { key: 'backup_enabled', label: 'Enable Automatic Backups', type: 'boolean' },
      { key: 'backup_frequency', label: 'Backup Frequency (hours)', type: 'number' },
      { key: 'backup_retention', label: 'Backup Retention (days)', type: 'number' },
      { key: 'backup_path', label: 'Backup Path', type: 'string' },
    ]
  }
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const api = useApi();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      const settingsMap = {};
      response.data.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentCategory = settingCategories[activeTab];
      const settingsToUpdate = currentCategory.fields.map(field => ({
        category: currentCategory.key,
        key: field.key,
        value: settings[field.key],
        type: field.type,
        isEncrypted: field.encrypted
      }));

      await api.post('/settings', { settings: settingsToUpdate });
      setSuccess('Settings saved successfully');
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const currentCategory = settingCategories[activeTab];
      const response = await api.post('/settings/test', {
        category: currentCategory.key
      });
      setTestResult(response.data);
      setTestDialogOpen(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setTesting(false);
    }
  };

  const handleApply = async () => {
    try {
      setSaving(true);
      const currentCategory = settingCategories[activeTab];
      await api.post('/settings/apply', {
        category: currentCategory.key
      });
      setSuccess('Settings applied successfully');
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!settings[field.key]}
                onChange={(e) => handleChange(field.key, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case 'password':
        return (
          <TextField
            type="password"
            label={field.label}
            value={settings[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: <LockIcon color="action" />
            }}
          />
        );

      case 'json':
        return (
          <TextField
            label={field.label}
            value={typeof settings[field.key] === 'object' ? 
              JSON.stringify(settings[field.key], null, 2) : 
              settings[field.key] || ''}
            onChange={(e) => {
              try {
                const value = JSON.parse(e.target.value);
                handleChange(field.key, value);
              } catch {
                handleChange(field.key, e.target.value);
              }
            }}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        );

      default:
        return (
          <TextField
            type={field.type}
            label={field.label}
            value={settings[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            fullWidth
            margin="normal"
          />
        );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          System Settings
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {settingCategories.map(category => (
              <Tab key={category.key} label={category.label} />
            ))}
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          {settingCategories[activeTab].fields.map(field => (
            <Box key={field.key}>
              {renderField(field)}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleApply}
            disabled={saving}
          >
            Apply Settings
          </Button>

          {['email', 'database'].includes(settingCategories[activeTab].key) && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<TestIcon />}
              onClick={handleTest}
              disabled={testing}
            >
              Test Connection
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)}>
        <DialogTitle>Test Results</DialogTitle>
        <DialogContent>
          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'}>
              {testResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        message={success}
      />
    </Container>
  );
};

export default SettingsPage;
