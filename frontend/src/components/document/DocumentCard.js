import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CardActionArea
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const DocumentCard = ({
  document,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  onVersionHistory
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => (event) => {
    event.stopPropagation();
    handleMenuClose();
    action();
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'default';
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      elevation={1}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <CardActionArea onClick={onView}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <DocumentIcon color="primary" />
            <Typography variant="subtitle1" noWrap>
              {document.title}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
              height: '40px'
            }}
          >
            {document.description}
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
            {document.tags?.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
              />
            ))}
            {document.tags?.length > 3 && (
              <Chip
                label={`+${document.tags.length - 3}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip
              label={document.status}
              size="small"
              color={getStatusColor(document.status)}
            />
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
        <Tooltip title="View">
          <IconButton size="small" onClick={onView}>
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton size="small" onClick={onDownload}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton
          size="small"
          onClick={handleMenuClick}
          aria-label="more options"
          aria-controls={open ? 'document-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <MoreIcon fontSize="small" />
        </IconButton>
      </CardActions>

      <Menu
        id="document-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleAction(onEdit)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAction(onShare)}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAction(onVersionHistory)}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Version History</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={handleAction(onDelete)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default DocumentCard;
