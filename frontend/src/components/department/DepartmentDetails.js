import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as DepartmentIcon,
  SupervisorAccount as ManagerIcon,
  Group as MembersIcon,
  Description as DocumentIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { memberSchema } from '../../validation/departmentSchemas';
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

const DepartmentDetails = ({ department }) => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = React.useState(0);
  const [memberDialogOpen, setMemberDialogOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState(null);
  const { loading, error } = useSelector(state => state.department);
  const users = useSelector(state => state.user.users);

  const formik = useFormik({
    initialValues: selectedMember || {
      userId: '',
      role: '',
      startDate: null,
      endDate: null
    },
    validationSchema: memberSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (selectedMember) {
          // await dispatch(updateDepartmentMember(values)).unwrap();
        } else {
          // await dispatch(addDepartmentMember(values)).unwrap();
        }
        handleCloseDialog();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleCloseDialog = () => {
    setMemberDialogOpen(false);
    setSelectedMember(null);
    formik.resetForm();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddMember = () => {
    setMemberDialogOpen(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setMemberDialogOpen(true);
  };

  const handleRemoveMember = async (memberId) => {
    try {
      // await dispatch(removeDepartmentMember(memberId)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <DepartmentIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h5">
                {department.name}
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {department.description}
            </Typography>
            <Box display="flex" gap={2}>
              <Chip
                icon={<ManagerIcon />}
                label={`${department.managerCount} Managers`}
              />
              <Chip
                icon={<MembersIcon />}
                label={`${department.memberCount} Members`}
              />
              <Chip
                icon={<DocumentIcon />}
                label={`${department.documentCount} Documents`}
              />
              <Chip
                icon={<TaskIcon />}
                label={`${department.taskCount} Active Tasks`}
              />
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit Department
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Members" />
          <Tab label="Documents" />
          <Tab label="Tasks" />
          <Tab label="Activity" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Department Members
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMember}
            >
              Add Member
            </Button>
          </Box>

          {error && (
            <ErrorAlert
              error={error}
              sx={{ mb: 3 }}
            />
          )}

          <List>
            {department.members?.map((member) => (
              <ListItem
                key={member.id}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      onClick={() => handleEditMember(member)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar src={member.avatar}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {member.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={member.role}
                        color={member.role === 'Manager' ? 'primary' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {member.email}
                        </Typography>
                      </Box>
                      {member.phone && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {member.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Department Documents
          </Typography>
          {/* Add document list component */}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Department Tasks
          </Typography>
          {/* Add task list component */}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Department Activity
          </Typography>
          {/* Add activity timeline component */}
        </TabPanel>
      </Paper>

      <Dialog
        open={memberDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedMember ? 'Edit Member' : 'Add Member'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  id="userId"
                  options={users}
                  getOptionLabel={(option) => option.name}
                  value={users.find(user => user.id === formik.values.userId) || null}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('userId', newValue?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select User"
                      error={formik.touched.userId && Boolean(formik.errors.userId)}
                      helperText={formik.touched.userId && formik.errors.userId}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="role"
                  name="role"
                  label="Role"
                  select
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                  helperText={formik.touched.role && formik.errors.role}
                >
                  <option value="Manager">Manager</option>
                  <option value="Member">Member</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="startDate"
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={formik.values.startDate || ''}
                  onChange={formik.handleChange}
                  error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                  helperText={formik.touched.startDate && formik.errors.startDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="endDate"
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={formik.values.endDate || ''}
                  onChange={formik.handleChange}
                  error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                  helperText={formik.touched.endDate && formik.errors.endDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
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
              startIcon={selectedMember ? <EditIcon /> : <AddIcon />}
            >
              {selectedMember ? 'Update' : 'Add'} Member
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DepartmentDetails;
