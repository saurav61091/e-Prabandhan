import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as DepartmentIcon,
  VpnKey as RoleIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { userSchema } from '../../validation/userSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';
import NoData from '../common/NoData';

const UserCard = ({
  user,
  onEdit,
  onDelete,
  onBlock,
  onResetPassword
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleAction = (action) => () => {
    handleMenuClose();
    action();
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={2}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 56, height: 56 }}
            >
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              {user.phone && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {user.phone}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
        </Box>

        <Box display="flex" gap={1} mt={2}>
          <Chip
            icon={<DepartmentIcon />}
            label={user.department}
            size="small"
          />
          <Chip
            icon={<RoleIcon />}
            label={user.role}
            size="small"
            color="primary"
          />
          {user.status === 'blocked' && (
            <Chip
              icon={<BlockIcon />}
              label="Blocked"
              size="small"
              color="error"
            />
          )}
        </Box>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleAction(() => onEdit(user))}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit User</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleAction(() => onResetPassword(user))}>
            <ListItemIcon>
              <RefreshIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Reset Password</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={handleAction(() => onBlock(user))}
            sx={{ color: user.status === 'blocked' ? 'success.main' : 'error.main' }}
          >
            <ListItemIcon>
              <BlockIcon fontSize="small" color={user.status === 'blocked' ? 'success' : 'error'} />
            </ListItemIcon>
            <ListItemText>{user.status === 'blocked' ? 'Unblock' : 'Block'} User</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={handleAction(() => onDelete(user))}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete User</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

const UserList = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const { users, departments, loading, error } = useSelector(state => ({
    ...state.user,
    departments: state.department.departments
  }));

  const formik = useFormik({
    initialValues: selectedUser || {
      name: '',
      email: '',
      phone: '',
      departmentId: '',
      role: '',
      status: 'active'
    },
    validationSchema: userSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (selectedUser) {
          // await dispatch(updateUser(values)).unwrap();
        } else {
          // await dispatch(createUser(values)).unwrap();
        }
        handleCloseDialog();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    formik.resetForm();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = async (user) => {
    try {
      // await dispatch(deleteUser(user.id)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleBlockUser = async (user) => {
    try {
      // await dispatch(toggleUserBlock(user.id)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleResetPassword = async (user) => {
    try {
      // await dispatch(resetUserPassword(user.id)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || user.departmentId === departmentFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {filteredUsers.length === 0 ? (
        <NoData
          message="No users found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <UserCard
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onBlock={handleBlockUser}
                onResetPassword={handleResetPassword}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add User'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

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

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    id="departmentId"
                    name="departmentId"
                    value={formik.values.departmentId}
                    onChange={formik.handleChange}
                    error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    id="role"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                    label="Role"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={selectedUser ? <EditIcon /> : <AddIcon />}
            >
              {selectedUser ? 'Update' : 'Add'} User
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserList;
