import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CloneIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const RetentionPolicyManager = () => {
  const [policies, setPolicies] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    fileTypes: [],
    retentionPeriod: 365,
    warningPeriod: 30,
    action: 'archive',
    archivePath: '',
    requireApproval: true,
    approvers: [],
    autoNotify: true,
    notifyUsers: [],
    isActive: true
  });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchPolicies();
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('/api/retention-policies');
      setPolicies(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching policies', { variant: 'error' });
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching departments', { variant: 'error' });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching users', { variant: 'error' });
    }
  };

  const handleOpen = (policy = null) => {
    if (policy) {
      setFormData({ ...policy });
      setEditingPolicy(policy);
    } else {
      setFormData({
        name: '',
        description: '',
        department: '',
        fileTypes: [],
        retentionPeriod: 365,
        warningPeriod: 30,
        action: 'archive',
        archivePath: '',
        requireApproval: true,
        approvers: [],
        autoNotify: true,
        notifyUsers: [],
        isActive: true
      });
      setEditingPolicy(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPolicy(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingPolicy) {
        await axios.put(`/api/retention-policies/${editingPolicy.id}`, formData);
        enqueueSnackbar('Policy updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/retention-policies', formData);
        enqueueSnackbar('Policy created successfully', { variant: 'success' });
      }
      handleClose();
      fetchPolicies();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Error saving policy', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      await axios.delete(`/api/retention-policies/${policyId}`);
      enqueueSnackbar('Policy deleted successfully', { variant: 'success' });
      fetchPolicies();
    } catch (error) {
      enqueueSnackbar('Error deleting policy', { variant: 'error' });
    }
  };

  const handleClone = (policy) => {
    const clonedData = {
      ...policy,
      name: `Copy of ${policy.name}`,
      id: undefined
    };
    setFormData(clonedData);
    setEditingPolicy(null);
    setOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Retention Policies</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Policy
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Retention Period</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.name}</TableCell>
                <TableCell>{policy.department || 'All'}</TableCell>
                <TableCell>{policy.retentionPeriod} days</TableCell>
                <TableCell>{policy.action}</TableCell>
                <TableCell>
                  <Chip
                    label={policy.isActive ? 'Active' : 'Inactive'}
                    color={policy.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpen(policy)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Clone">
                    <IconButton onClick={() => handleClone(policy)}>
                      <CloneIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(policy.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPolicy ? 'Edit Retention Policy' : 'New Retention Policy'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  label="Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  name="action"
                  value={formData.action}
                  onChange={handleInputChange}
                  label="Action"
                >
                  <MenuItem value="archive">Archive</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Retention Period (days)"
                name="retentionPeriod"
                value={formData.retentionPeriod}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Warning Period (days)"
                name="warningPeriod"
                value={formData.warningPeriod}
                onChange={handleInputChange}
              />
            </Grid>
            {formData.action === 'archive' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Archive Path"
                  name="archivePath"
                  value={formData.archivePath}
                  onChange={handleInputChange}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Approvers</InputLabel>
                <Select
                  multiple
                  name="approvers"
                  value={formData.approvers}
                  onChange={handleInputChange}
                  label="Approvers"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const user = users.find(u => u.id === value);
                        return (
                          <Chip
                            key={value}
                            label={user ? user.name : value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Notify Users</InputLabel>
                <Select
                  multiple
                  name="notifyUsers"
                  value={formData.notifyUsers}
                  onChange={handleInputChange}
                  label="Notify Users"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const user = users.find(u => u.id === value);
                        return (
                          <Chip
                            key={value}
                            label={user ? user.name : value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requireApproval}
                    onChange={handleSwitchChange}
                    name="requireApproval"
                  />
                }
                label="Require Approval"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoNotify}
                    onChange={handleSwitchChange}
                    name="autoNotify"
                  />
                }
                label="Auto Notify"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RetentionPolicyManager;
