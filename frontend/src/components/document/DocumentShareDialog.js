import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Switch,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { shareSchema } from '../../validation/documentSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const permissionLevels = [
  { id: 'view', label: 'Can View' },
  { id: 'comment', label: 'Can Comment' },
  { id: 'edit', label: 'Can Edit' }
];

const DocumentShareDialog = ({
  open,
  onClose,
  document,
  onShare,
  existingShares = []
}) => {
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const [publicLink, setPublicLink] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      users: [],
      permission: 'view',
      message: ''
    },
    validationSchema: shareSchema,
    onSubmit: async (values) => {
      try {
        await onShare({
          documentId: document.id,
          users: selectedUsers.map(user => ({
            userId: user.id,
            permission: values.permission
          })),
          message: values.message
        });
        handleClose();
      } catch (err) {
        // Error handled by the reducer
      }
    }
  });

  const handleClose = () => {
    formik.resetForm();
    setSelectedUsers([]);
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    // Show success message
  };

  const handleTogglePublic = (event) => {
    setIsPublic(event.target.checked);
    if (event.target.checked) {
      // Generate public link
      setPublicLink(`https://your-domain.com/documents/${document.id}/public`);
    } else {
      setPublicLink('');
    }
  };

  const handleRemoveShare = (userId) => {
    // Handle removing share
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Share Document</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              {document?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Share this document with others
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              People with access
            </Typography>
            <List>
              {existingShares.map((share) => (
                <ListItem
                  key={share.userId}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveShare(share.userId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={share.userName}
                    secondary={
                      permissionLevels.find(p => p.id === share.permission)?.label
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Add people
            </Typography>
            <Autocomplete
              multiple
              id="users"
              options={[]} // Add user options
              getOptionLabel={(option) => option.name}
              value={selectedUsers}
              onChange={(event, newValue) => {
                setSelectedUsers(newValue);
                formik.setFieldValue('users', newValue.map(user => user.id));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Add email or name"
                  error={formik.touched.users && Boolean(formik.errors.users)}
                  helperText={formik.touched.users && formik.errors.users}
                />
              )}
            />
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Permission</InputLabel>
            <Select
              id="permission"
              name="permission"
              value={formik.values.permission}
              onChange={formik.handleChange}
              label="Permission"
            >
              {permissionLevels.map((level) => (
                <MenuItem key={level.id} value={level.id}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            id="message"
            name="message"
            label="Message (optional)"
            multiline
            rows={2}
            value={formik.values.message}
            onChange={formik.handleChange}
            margin="normal"
          />

          <Divider sx={{ my: 3 }} />

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle2">
                Get link
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Anyone with the link can view
              </Typography>
            </Box>
            <Switch
              checked={isPublic}
              onChange={handleTogglePublic}
            />
          </Box>

          {isPublic && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  mb: 1
                }}
              >
                {publicLink}
              </Typography>
              <Button
                startIcon={<CopyIcon />}
                onClick={handleCopyLink}
                size="small"
              >
                Copy link
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={selectedUsers.length === 0}
          >
            Share
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DocumentShareDialog;
