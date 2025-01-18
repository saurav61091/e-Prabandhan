import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as DepartmentIcon,
  VpnKey as RoleIcon,
  CalendarToday as JoinedIcon,
  Assignment as TaskIcon,
  Description as DocumentIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { format } from 'date-fns';
import { profileSchema, passwordSchema } from '../../validation/userSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    {...other}
  >
    {value === index && (
      <Box sx={{ py: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const UserProfile = ({ userId }) => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = React.useState(0);
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const { user, loading, error } = useSelector(state => state.user);

  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // await dispatch(updateProfile(values)).unwrap();
        handleCloseProfileDialog();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      try {
        // await dispatch(changePassword(values)).unwrap();
        handleClosePasswordDialog();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
    profileFormik.resetForm();
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    passwordFormik.resetForm();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      try {
        // await dispatch(updateAvatar(file)).unwrap();
      } catch (err) {
        // Error handled by reducer
      }
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>User not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={3}>
          <Box position="relative">
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 120, height: 120 }}
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-input"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-input">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper'
                }}
              >
                <UploadIcon />
              </IconButton>
            </label>
          </Box>

          <Box flexGrow={1}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h4" gutterBottom>
                  {user.name}
                </Typography>
                <Box display="flex" gap={2} mb={2}>
                  <Chip
                    icon={<DepartmentIcon />}
                    label={user.department}
                  />
                  <Chip
                    icon={<RoleIcon />}
                    label={user.role}
                    color="primary"
                  />
                  <Chip
                    icon={<JoinedIcon />}
                    label={`Joined ${format(new Date(user.joinedAt), 'MMM yyyy')}`}
                  />
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {user.bio}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setProfileDialogOpen(true)}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Activity" />
          <Tab label="Settings" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={user.phone || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DepartmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Department"
                      secondary={user.department}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TaskIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Tasks"
                      secondary={`${user.stats.completedTasks} completed, ${user.stats.pendingTasks} pending`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DocumentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Documents"
                      secondary={`${user.stats.documents} processed`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Notifications"
                      secondary={`${user.stats.unreadNotifications} unread`}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          {/* Add activity timeline component */}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Security Settings
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </Box>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Enable additional security"
                    />
                    <Button variant="text">
                      Enable
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Preferences
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive email updates"
                    />
                    <Button variant="text">
                      Configure
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleCloseProfileDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={profileFormik.handleSubmit}>
          <DialogTitle>
            Edit Profile
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={profileFormik.values.name}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.name && Boolean(profileFormik.errors.name)}
                  helperText={profileFormik.touched.name && profileFormik.errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                  helperText={profileFormik.touched.email && profileFormik.errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={profileFormik.values.phone}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.phone && Boolean(profileFormik.errors.phone)}
                  helperText={profileFormik.touched.phone && profileFormik.errors.phone}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="bio"
                  name="bio"
                  label="Bio"
                  multiline
                  rows={3}
                  value={profileFormik.values.bio}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.bio && Boolean(profileFormik.errors.bio)}
                  helperText={profileFormik.touched.bio && profileFormik.errors.bio}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProfileDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<EditIcon />}
            >
              Update Profile
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogTitle>
            Change Password
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  label="Current Password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SecurityIcon />}
            >
              Change Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
