import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';

const PERMISSION_TYPES = {
  view: 'View',
  edit: 'Edit',
  delete: 'Delete',
  manage: 'Manage',
  start: 'Start',
  assign: 'Assign',
  reassign: 'Reassign',
  cancel: 'Cancel',
  viewMetrics: 'View Metrics',
  exportData: 'Export Data'
};

const WorkflowPermissions = () => {
  const { templateId } = useParams();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({
    entityType: 'user',
    entityId: '',
    permissions: {},
    priority: 0,
    conditions: {
      fileTypes: [],
      departments: [],
      metadata: {}
    }
  });
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [targetTemplateId, setTargetTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchPermissions();
    fetchUsers();
    fetchRoles();
    fetchDepartments();
    fetchTemplates();
  }, [templateId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/workflow-permissions/templates/${templateId}`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      enqueueSnackbar('Failed to fetch permissions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/workflow-templates');
      setTemplates(response.data.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleDialogOpen = (permission = null) => {
    if (permission) {
      setEditingPermission(permission);
      setFormData(permission);
    } else {
      setEditingPermission(null);
      setFormData({
        entityType: 'user',
        entityId: '',
        permissions: {},
        priority: 0,
        conditions: {
          fileTypes: [],
          departments: [],
          metadata: {}
        }
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingPermission(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingPermission) {
        await axios.put(`/api/workflow-permissions/${editingPermission.id}`, formData);
        enqueueSnackbar('Permission updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/workflow-permissions', {
          ...formData,
          templateId
        });
        enqueueSnackbar('Permission created successfully', { variant: 'success' });
      }
      handleDialogClose();
      fetchPermissions();
    } catch (error) {
      console.error('Error saving permission:', error);
      enqueueSnackbar('Failed to save permission', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/workflow-permissions/${id}`);
      enqueueSnackbar('Permission deleted successfully', { variant: 'success' });
      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      enqueueSnackbar('Failed to delete permission', { variant: 'error' });
    }
  };

  const handleCopyPermissions = async () => {
    try {
      await axios.post('/api/workflow-permissions/copy', {
        sourceTemplateId: templateId,
        targetTemplateId
      });
      enqueueSnackbar('Permissions copied successfully', { variant: 'success' });
      setCopyDialogOpen(false);
    } catch (error) {
      console.error('Error copying permissions:', error);
      enqueueSnackbar('Failed to copy permissions', { variant: 'error' });
    }
  };

  const getEntityName = (permission) => {
    switch (permission.entityType) {
      case 'user':
        return users.find(u => u.id === permission.entityId)?.name || permission.entityId;
      case 'role':
        return roles.find(r => r.id === permission.entityId)?.name || permission.entityId;
      case 'department':
        return departments.find(d => d.id === permission.entityId)?.name || permission.entityId;
      default:
        return permission.entityId;
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
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Workflow Template Permissions</Typography>
        <Box>
          <Button
            startIcon={<CopyIcon />}
            onClick={() => setCopyDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Copy Permissions
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => handleDialogOpen()}
          >
            Add Permission
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Conditions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.entityType}</TableCell>
                <TableCell>{getEntityName(permission)}</TableCell>
                <TableCell>
                  {Object.entries(permission.permissions)
                    .filter(([, value]) => value)
                    .map(([key]) => PERMISSION_TYPES[key])
                    .join(', ')}
                </TableCell>
                <TableCell>{permission.priority}</TableCell>
                <TableCell>
                  {permission.conditions && Object.keys(permission.conditions).length > 0 ? (
                    <Tooltip title={JSON.stringify(permission.conditions, null, 2)}>
                      <span>View Conditions</span>
                    </Tooltip>
                  ) : (
                    'None'
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDialogOpen(permission)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(permission.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Permission Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPermission ? 'Edit Permission' : 'Add Permission'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="role">Role</MenuItem>
                <MenuItem value="department">Department</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Entity</InputLabel>
              <Select
                value={formData.entityId}
                onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
              >
                {formData.entityType === 'user' && users.map(user => (
                  <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                ))}
                {formData.entityType === 'role' && roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
                {formData.entityType === 'department' && departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              fullWidth
            />

            <Typography variant="subtitle1" gutterBottom>
              Permissions
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1}>
              {Object.entries(PERMISSION_TYPES).map(([key, label]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={formData.permissions[key] || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: {
                          ...formData.permissions,
                          [key]: e.target.checked
                        }
                      })}
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPermission ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Permissions Dialog */}
      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)}>
        <DialogTitle>Copy Permissions to Another Template</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Target Template</InputLabel>
            <Select
              value={targetTemplateId}
              onChange={(e) => setTargetTemplateId(e.target.value)}
            >
              {templates.map(template => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCopyPermissions} variant="contained">
            Copy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowPermissions;
