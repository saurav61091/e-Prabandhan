/**
 * Document Card Component
 * 
 * A card component that displays document information in a grid layout.
 * Features include:
 * - Document preview thumbnail
 * - Basic metadata display
 * - Action buttons for common operations
 * - Status indicators
 * - Context menu for additional actions
 * 
 * @component
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Box,
  CardActionArea
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { downloadDocument, deleteDocument } from '../../store/slices/documentSlice';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Document Card Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.document - Document data object
 * @param {function} props.onView - Handler for document view action
 * @param {function} props.onShare - Handler for document share action
 * @param {function} props.onVersionHistory - Handler for version history view
 * @param {function} props.onDelete - Handler for document deletion
 */
const DocumentCard = ({
  document,
  onView,
  onShare,
  onVersionHistory,
  onDelete
}) => {
  // State for context menu
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const { canDelete, canShare } = usePermissions();

  /**
   * Handle context menu open
   * @param {Object} event - Click event
   */
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handle context menu close
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle document download
   * Dispatches download action
   */
  const handleDownload = async () => {
    try {
      await dispatch(downloadDocument(document.id)).unwrap();
    } catch (error) {
      console.error('Download failed:', error);
    }
    handleMenuClose();
  };

  /**
   * Handle document deletion
   * Shows confirmation dialog before deleting
   */
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await dispatch(deleteDocument(document.id)).unwrap();
        onDelete?.(document.id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
    handleMenuClose();
  };

  /**
   * Get appropriate icon for document type
   * @returns {React.Component} Icon component
   */
  const getDocumentIcon = () => {
    // Add more icons based on document type
    return <DescriptionIcon sx={{ fontSize: 40 }} />;
  };

  /**
   * Get status chip color
   * @returns {string} Material-UI color
   */
  const getStatusColor = () => {
    switch (document.status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => onView(document)}>
        <CardMedia
          component="div"
          sx={{
            pt: '56.25%',
            position: 'relative',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {getDocumentIcon()}
        </CardMedia>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {document.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {document.description}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              label={document.status}
              size="small"
              color={getStatusColor()}
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Updated {formatDistanceToNow(new Date(document.updatedAt))} ago
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>

      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={handleDownload} size="small" title="Download">
          <DownloadIcon />
        </IconButton>
        {canShare && (
          <IconButton onClick={() => onShare(document)} size="small" title="Share">
            <ShareIcon />
          </IconButton>
        )}
        <IconButton
          onClick={handleMenuOpen}
          size="small"
          title="More actions"
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          onVersionHistory(document);
        }}>
          <HistoryIcon sx={{ mr: 1 }} /> Version History
        </MenuItem>
        {canDelete && (
          <MenuItem onClick={handleDelete}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

DocumentCard.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onShare: PropTypes.func,
  onVersionHistory: PropTypes.func,
  onDelete: PropTypes.func
};

export default DocumentCard;
