import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CloneIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { format } from 'date-fns';
import ConfirmDialog from '../common/ConfirmDialog';

const WorkflowTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/workflow/templates');
      setTemplates(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching workflow templates', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/workflow/templates/new');
  };

  const handleEdit = (template) => {
    navigate(`/workflow/templates/edit/${template.id}`);
  };

  const handleClone = async (template) => {
    try {
      const clonedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      };
      
      const response = await axios.post('/api/workflow/templates', clonedTemplate);
      enqueueSnackbar('Template cloned successfully', { variant: 'success' });
      fetchTemplates();
    } catch (error) {
      enqueueSnackbar('Error cloning template', { variant: 'error' });
    }
  };

  const handleDeleteClick = (template) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/workflow/templates/${selectedTemplate.id}`);
      enqueueSnackbar('Template deleted successfully', { variant: 'success' });
      fetchTemplates();
    } catch (error) {
      enqueueSnackbar('Error deleting template', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  const handleView = (template) => {
    setSelectedTemplate(template);
    setViewDialogOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Workflow Templates
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create New Template
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>File Types</TableCell>
                  <TableCell>Steps</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Modified</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.department}</TableCell>
                    <TableCell>
                      {template.fileTypes.map((type) => (
                        <Chip
                          key={type}
                          label={type}
                          size="small"
                          variant="outlined"
                          style={{ margin: '2px' }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>{template.steps.length} steps</TableCell>
                    <TableCell>
                      <Chip
                        label={template.active ? 'Active' : 'Inactive'}
                        color={template.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(template.updatedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => handleView(template)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(template)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Clone">
                        <IconButton size="small" onClick={() => handleClone(template)}>
                          <CloneIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteClick(template)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No workflow templates found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Workflow Template"
        content="Are you sure you want to delete this workflow template? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedTemplate(null);
        }}
      />

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?.name}
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedTemplate.description || 'No description provided'}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Steps
              </Typography>
              {selectedTemplate.steps.map((step, index) => (
                <Card key={step.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2">
                      {index + 1}. {step.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Type: {step.type}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Assigned to: {step.assignTo.type} ({step.assignTo.value})
                    </Typography>
                  </CardContent>
                </Card>
              ))}

              <Typography variant="subtitle1" gutterBottom>
                SLA Configuration
              </Typography>
              <Typography variant="body2">
                Warning Threshold: {selectedTemplate.sla.warningThreshold} days
              </Typography>
              <Typography variant="body2">
                Auto Reassign: {selectedTemplate.sla.autoReassign ? 'Yes' : 'No'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            color="primary"
            onClick={() => {
              setViewDialogOpen(false);
              handleEdit(selectedTemplate);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowTemplateList;
