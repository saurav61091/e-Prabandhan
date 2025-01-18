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
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Storage as StorageIcon,
  Settings as SettingsIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Check as VerifyIcon,
  Warning as WarningIcon,
  Google as GoogleIcon,
  Dropbox as DropboxIcon,
  OneDrive as OneDriveIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { storageSettingsSchema } from '../../validation/integrationSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const StorageIntegration = () => {
  const dispatch = useDispatch();
  const [syncDialogOpen, setSyncDialogOpen] = React.useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const { settings, loading, error } = useSelector(state => state.storageIntegration);

  const formik = useFormik({
    initialValues: {
      provider: settings?.provider || 'google',
      rootFolder: settings?.rootFolder || '',
      syncFrequency: settings?.syncFrequency || 'realtime',
      fileTypes: settings?.fileTypes || {
        documents: true,
        images: true,
        videos: true,
        archives: true
      },
      compression: settings?.compression || {
        enabled: true,
        quality: 'high',
        maxSize: 10
      }
    },
    validationSchema: storageSettingsSchema,
    onSubmit: async (values) => {
      try {
        // await dispatch(updateStorageSettings(values)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleConnect = async (provider) => {
    try {
      // await dispatch(connectStorage(provider)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleSync = async () => {
    try {
      // await dispatch(syncStorage()).unwrap();
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
          Storage Integration
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
        {/* Storage Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Storage Status
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <GoogleIcon color={settings?.connections?.google ? 'primary' : 'disabled'} />
                      <Box flex={1}>
                        <Typography variant="subtitle1">
                          Google Drive
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
                      <DropboxIcon color={settings?.connections?.dropbox ? 'primary' : 'disabled'} />
                      <Box flex={1}>
                        <Typography variant="subtitle1">
                          Dropbox
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {settings?.connections?.dropbox ? 'Connected' : 'Not Connected'}
                        </Typography>
                      </Box>
                      <Button
                        variant={settings?.connections?.dropbox ? 'outlined' : 'contained'}
                        onClick={() => handleConnect('dropbox')}
                      >
                        {settings?.connections?.dropbox ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <OneDriveIcon color={settings?.connections?.onedrive ? 'primary' : 'disabled'} />
                      <Box flex={1}>
                        <Typography variant="subtitle1">
                          OneDrive
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {settings?.connections?.onedrive ? 'Connected' : 'Not Connected'}
                        </Typography>
                      </Box>
                      <Button
                        variant={settings?.connections?.onedrive ? 'outlined' : 'contained'}
                        onClick={() => handleConnect('onedrive')}
                      >
                        {settings?.connections?.onedrive ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Storage Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Storage Settings
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
                    <MenuItem value="google">Google Drive</MenuItem>
                    <MenuItem value="dropbox">Dropbox</MenuItem>
                    <MenuItem value="onedrive">OneDrive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="rootFolder"
                  name="rootFolder"
                  label="Root Folder"
                  value={formik.values.rootFolder}
                  onChange={formik.handleChange}
                  error={formik.touched.rootFolder && Boolean(formik.errors.rootFolder)}
                  helperText={formik.touched.rootFolder && formik.errors.rootFolder}
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

        {/* File Type Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              File Type Settings
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    id="fileTypes.documents"
                    name="fileTypes.documents"
                    checked={formik.values.fileTypes.documents}
                    onChange={formik.handleChange}
                  />
                }
                label="Documents (.doc, .pdf, .txt)"
              />
              <FormControlLabel
                control={
                  <Switch
                    id="fileTypes.images"
                    name="fileTypes.images"
                    checked={formik.values.fileTypes.images}
                    onChange={formik.handleChange}
                  />
                }
                label="Images (.jpg, .png, .gif)"
              />
              <FormControlLabel
                control={
                  <Switch
                    id="fileTypes.videos"
                    name="fileTypes.videos"
                    checked={formik.values.fileTypes.videos}
                    onChange={formik.handleChange}
                  />
                }
                label="Videos (.mp4, .avi, .mov)"
              />
              <FormControlLabel
                control={
                  <Switch
                    id="fileTypes.archives"
                    name="fileTypes.archives"
                    checked={formik.values.fileTypes.archives}
                    onChange={formik.handleChange}
                  />
                }
                label="Archives (.zip, .rar, .7z)"
              />
            </FormGroup>
          </Paper>
        </Grid>

        {/* Compression Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compression Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
              </Grid>
              {formik.values.compression.enabled && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Quality</InputLabel>
                      <Select
                        id="compression.quality"
                        name="compression.quality"
                        value={formik.values.compression.quality}
                        onChange={formik.handleChange}
                        label="Quality"
                      >
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      id="compression.maxSize"
                      name="compression.maxSize"
                      label="Max File Size (MB)"
                      value={formik.values.compression.maxSize}
                      onChange={formik.handleChange}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Storage Usage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Storage Usage
            </Typography>
            <List>
              {(settings?.usage || []).map((item) => (
                <ListItem key={item.id}>
                  <ListItemIcon>
                    <Box position="relative" display="inline-flex">
                      <CircularProgress
                        variant="determinate"
                        value={item.usagePercent}
                        color={
                          item.usagePercent > 90 ? 'error' :
                          item.usagePercent > 70 ? 'warning' : 'primary'
                        }
                      />
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        bottom={0}
                        right={0}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography
                          variant="caption"
                          component="div"
                          color="text.secondary"
                        >
                          {item.usagePercent}%
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.provider}
                    secondary={`${item.used} / ${item.total} GB`}
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
          Sync Storage
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            This will sync all files between the selected storage providers.
          </Alert>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Sync Direction</InputLabel>
            <Select
              value={settings?.syncDirection || 'both'}
              label="Sync Direction"
              // Add necessary handlers
            >
              <MenuItem value="both">Two-way Sync</MenuItem>
              <MenuItem value="upload">Upload Only</MenuItem>
              <MenuItem value="download">Download Only</MenuItem>
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
    </Box>
  );
};

export default StorageIntegration;
