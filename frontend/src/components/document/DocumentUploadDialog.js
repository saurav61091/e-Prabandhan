/**
 * Document Upload Dialog Component
 * 
 * A modal dialog component that handles document upload functionality.
 * Features include:
 * - File selection and preview
 * - Metadata input (title, description, tags, etc.)
 * - File type validation
 * - Progress tracking
 * - Error handling
 * 
 * @component
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  MenuItem,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { documentSchema } from '../../validation/documentSchemas';
import { uploadDocument } from '../../store/slices/documentSlice';
import { useFileUpload } from '../../hooks/useFileUpload';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

/**
 * Document Upload Dialog Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {function} props.onClose - Handler for dialog close
 */
const DocumentUploadDialog = ({ open, onClose }) => {
  // State management
  const dispatch = useDispatch();
  const { upload, progress, isUploading, error: uploadError } = useFileUpload();
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [tags, setTags] = React.useState([]);
  const [tagInput, setTagInput] = React.useState('');
  const departments = useSelector(state => state.department.departments);
  const { error } = useSelector(state => state.document);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      department: '',
      file: null
    },
    validationSchema: documentSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('department', values.department);
        formData.append('tags', JSON.stringify(tags));

        await dispatch(uploadDocument({
          data: formData,
          onProgress: (percent) => {
            // Progress is handled by useFileUpload hook
          }
        })).unwrap();
        
        handleClose();
      } catch (err) {
        // Error is handled by the reducer
      }
    }
  });

  /**
   * Handle dialog close
   * Resets form and state
   */
  const handleClose = () => {
    formik.resetForm();
    setSelectedFile(null);
    setTags([]);
    setTagInput('');
    onClose();
  };

  /**
   * Handle file selection
   * @param {Object} event - File selection event
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      formik.setFieldValue('file', file);
    }
  };

  /**
   * Handle tag addition
   * @param {Object} event - Keypress event
   */
  const handleTagAdd = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  /**
   * Handle tag deletion
   * @param {string} tagToDelete - Tag to remove
   */
  const handleTagDelete = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Upload Document</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {(error || uploadError) && (
            <ErrorAlert
              error={error || uploadError}
              title="Upload Failed"
              sx={{ mb: 2 }}
            />
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <UploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  {selectedFile ? selectedFile.name : 'Click or drag file to upload'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG
                </Typography>
              </Box>
              {formik.touched.file && formik.errors.file && (
                <FormError error={formik.errors.file} />
              )}
            </Grid>

            {isUploading && (
              <Grid item xs={12}>
                <Box sx={{ width: '100%' }}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="caption" color="text.secondary">
                    Uploading... {progress}%
                  </Typography>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Document Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="department"
                name="department"
                label="Department"
                select
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.department && Boolean(formik.errors.department)}
                helperText={formik.touched.department && formik.errors.department}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tags
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleTagDelete(tag)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleTagAdd}
                  disabled={!tagInput}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isUploading || !selectedFile}
            startIcon={<UploadIcon />}
          >
            Upload
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DocumentUploadDialog;
