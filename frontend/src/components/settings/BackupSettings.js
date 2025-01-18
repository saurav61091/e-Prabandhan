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
  Backup as BackupIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { backupSettingsSchema } from '../../validation/settingsSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';
import { formatDistanceToNow, format } from 'date-fns';

const BackupSettings = () => {
  const dispatch = useDispatch();
  const [backupDialogOpen, setBackupDialogOpen] = React.useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = React.useState(false);
  const { settings, backups, loading, error } = useSelector(state => state.backup);

  const formik = useFormik({
    initialValues: {
      autoBackup: settings?.autoBackup || {
        enabled: true,
        frequency: 'daily',
        time: '00:00',
        retentionDays: 30
      },
      storage: settings?.storage || {
        type: 'local',
        path: '/backups',
        maxSize: 1024
      },
      compression: settings?.compression || {
        enabled: true,
        level: 'medium'
      },
      encryption: settings?.encryption || {
        enabled: true,
        algorithm: 'AES-256'
      }
    },
    validationSchema: backupSettingsSchema,
    onSubmit: async (values) => {
      try {
        // await dispatch(updateBackupSettings(values)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleCreateBackup = async () => {
    try {
      // await dispatch(createBackup()).unwrap();
      setBackupDialogOpen(false);
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleRestoreBackup = async (backupId) => {
    try {
      // await dispatch(restoreBackup(backupId)).unwrap();
      setRestoreDialogOpen(false);
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleDeleteBackup = async (backupId) => {
    try {
      // await dispatch(deleteBackup(backupId)).unwrap();
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
          Backup & Restore
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setRestoreDialogOpen(true)}
          >
            Restore
          </Button>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={() => setBackupDialogOpen(true)}
          >
            Create Backup
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Automatic Backup
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        id="autoBackup.enabled"
                        name="autoBackup.enabled"
                        checked={formik.values.autoBackup.enabled}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Enable Automatic Backup"
                  />
                </FormGroup>
              </Grid>
              {formik.values.autoBackup.enabled && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <Select
                        id="autoBackup.frequency"
                        name="autoBackup.frequency"
                        value={formik.values.autoBackup.frequency}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.autoBackup?.frequency &&
                          Boolean(formik.errors.autoBackup?.frequency)
                        }
                      >
                        <MenuItem value="hourly">Every Hour</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="time"
                      id="autoBackup.time"
                      name="autoBackup.time"
                      label="Backup Time"
                      value={formik.values.autoBackup.time}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.autoBackup?.time &&
                        Boolean(formik.errors.autoBackup?.time)
                      }
                      helperText={
                        formik.touched.autoBackup?.time &&
                        formik.errors.autoBackup?.time
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      id="autoBackup.retentionDays"
                      name="autoBackup.retentionDays"
                      label="Retention Period (Days)"
                      value={formik.values.autoBackup.retentionDays}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.autoBackup?.retentionDays &&
                        Boolean(formik.errors.autoBackup?.retentionDays)
                      }
                      helperText={
                        formik.touched.autoBackup?.retentionDays &&
                        formik.errors.autoBackup?.retentionDays
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Storage Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Select
                    id="storage.type"
                    name="storage.type"
                    value={formik.values.storage.type}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.storage?.type &&
                      Boolean(formik.errors.storage?.type)
                    }
                  >
                    <MenuItem value="local">Local Storage</MenuItem>
                    <MenuItem value="s3">Amazon S3</MenuItem>
                    <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                    <MenuItem value="azure">Azure Blob Storage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="storage.path"
                  name="storage.path"
                  label="Storage Path"
                  value={formik.values.storage.path}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.storage?.path &&
                    Boolean(formik.errors.storage?.path)
                  }
                  helperText={
                    formik.touched.storage?.path &&
                    formik.errors.storage?.path
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  id="storage.maxSize"
                  name="storage.maxSize"
                  label="Max Storage Size (MB)"
                  value={formik.values.storage.maxSize}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.storage?.maxSize &&
                    Boolean(formik.errors.storage?.maxSize)
                  }
                  helperText={
                    formik.touched.storage?.maxSize &&
                    formik.errors.storage?.maxSize
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Advanced Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        id="compression.enabled"
                        name="compression.enabled"
                        checked={formik.values.compression.enabled}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Enable Compression"
                  />
                </FormGroup>
                {formik.values.compression.enabled && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <Select
                      id="compression.level"
                      name="compression.level"
                      value={formik.values.compression.level}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        id="encryption.enabled"
                        name="encryption.enabled"
                        checked={formik.values.encryption.enabled}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Enable Encryption"
                  />
                </FormGroup>
                {formik.values.encryption.enabled && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <Select
                      id="encryption.algorithm"
                      name="encryption.algorithm"
                      value={formik.values.encryption.algorithm}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="AES-128">AES-128</MenuItem>
                      <MenuItem value="AES-256">AES-256</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Backup History
            </Typography>
            <List>
              {backups?.map((backup) => (
                <ListItem
                  key={backup.id}
                  secondaryAction={
                    <Box>
                      <Tooltip title="Restore">
                        <IconButton
                          onClick={() => handleRestoreBackup(backup.id)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDeleteBackup(backup.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <BackupIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={format(new Date(backup.timestamp), 'PPpp')}
                    secondary={`Size: ${backup.size}MB | Type: ${backup.type}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={backupDialogOpen}
        onClose={() => setBackupDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create New Backup
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            This will create a new backup of your entire system. The process may take several minutes.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={handleCreateBackup}
          >
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Restore from Backup
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Restoring from a backup will replace all current data. This action cannot be undone.
          </Alert>
          <List sx={{ mt: 2 }}>
            {backups?.slice(0, 5).map((backup) => (
              <ListItem
                key={backup.id}
                button
                onClick={() => handleRestoreBackup(backup.id)}
              >
                <ListItemIcon>
                  <BackupIcon />
                </ListItemIcon>
                <ListItemText
                  primary={format(new Date(backup.timestamp), 'PPpp')}
                  secondary={`Size: ${backup.size}MB | Type: ${backup.type}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupSettings;
