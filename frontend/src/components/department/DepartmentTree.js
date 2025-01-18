import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
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
  Tooltip,
  Collapse,
  LinearProgress
} from '@mui/material';
import {
  TreeView,
  TreeItem
} from '@mui/lab';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Business as DepartmentIcon,
  Group as TeamIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { departmentSchema } from '../../validation/departmentSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const DepartmentTreeItem = ({
  node,
  onAdd,
  onEdit,
  onDelete,
  onMove
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [expanded, setExpanded] = React.useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleAction = (action) => (event) => {
    event.stopPropagation();
    handleMenuClose();
    action();
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <IconButton
          size="small"
          onClick={handleToggle}
          sx={{ mr: 1 }}
        >
          {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
        </IconButton>

        {node.type === 'department' ? (
          <DepartmentIcon color="primary" sx={{ mr: 1 }} />
        ) : (
          <TeamIcon color="secondary" sx={{ mr: 1 }} />
        )}

        <Typography sx={{ flexGrow: 1 }}>
          {node.name}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
          {node.memberCount} members
        </Typography>

        <IconButton
          size="small"
          onClick={handleMenuOpen}
        >
          <MoreIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleAction(() => onAdd(node))}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Subdepartment</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAction(() => onEdit(node))}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAction(() => onMove(node, 'up'))}>
          <ListItemIcon>
            <MoveUpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move Up</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAction(() => onMove(node, 'down'))}>
          <ListItemIcon>
            <MoveDownIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move Down</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleAction(() => onDelete(node))}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Collapse in={expanded}>
        <Box sx={{ pl: 4 }}>
          {node.children?.map((child) => (
            <DepartmentTreeItem
              key={child.id}
              node={child}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

const DepartmentTree = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState(null);
  const { departments, loading, error } = useSelector(state => state.department);

  const formik = useFormik({
    initialValues: selectedNode || {
      name: '',
      description: '',
      parentId: null,
      type: 'department'
    },
    validationSchema: departmentSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (selectedNode) {
          // await dispatch(updateDepartment(values)).unwrap();
        } else {
          // await dispatch(createDepartment(values)).unwrap();
        }
        handleCloseDialog();
      } catch (err) {
        // Error handled by reducer
      }
    }
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedNode(null);
    formik.resetForm();
  };

  const handleAddDepartment = (parent = null) => {
    formik.setFieldValue('parentId', parent?.id || null);
    setDialogOpen(true);
  };

  const handleEditDepartment = (department) => {
    setSelectedNode(department);
    setDialogOpen(true);
  };

  const handleDeleteDepartment = async (department) => {
    try {
      // await dispatch(deleteDepartment(department.id)).unwrap();
    } catch (err) {
      // Error handled by reducer
    }
  };

  const handleMoveDepartment = async (department, direction) => {
    try {
      // await dispatch(moveDepartment({ id: department.id, direction })).unwrap();
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
          Department Structure
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAddDepartment()}
        >
          Add Department
        </Button>
      </Box>

      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      <Paper sx={{ p: 2 }}>
        {departments.map((department) => (
          <DepartmentTreeItem
            key={department.id}
            node={department}
            onAdd={handleAddDepartment}
            onEdit={handleEditDepartment}
            onDelete={handleDeleteDepartment}
            onMove={handleMoveDepartment}
          />
        ))}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedNode ? 'Edit Department' : 'Add Department'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Department Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={selectedNode ? <EditIcon /> : <AddIcon />}
            >
              {selectedNode ? 'Update' : 'Add'} Department
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DepartmentTree;
