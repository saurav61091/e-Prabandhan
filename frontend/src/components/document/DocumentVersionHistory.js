import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondary,
  Button,
  Tooltip,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Close as CloseIcon,
  History as HistoryIcon,
  RestorePage as RestoreIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

const DocumentVersionHistory = ({
  open,
  onClose,
  document,
  versions = [],
  onRestore,
  onDownload,
  onCompare
}) => {
  const [selectedVersions, setSelectedVersions] = React.useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [activeVersion, setActiveVersion] = React.useState(null);

  const handleVersionClick = (version) => {
    if (selectedVersions.includes(version.id)) {
      setSelectedVersions(selectedVersions.filter(id => id !== version.id));
    } else {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, version.id]);
      }
    }
  };

  const handleMenuOpen = (event, version) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveVersion(version);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveVersion(null);
  };

  const handleRestore = () => {
    if (activeVersion) {
      onRestore(activeVersion.id);
      handleMenuClose();
    }
  };

  const handleDownload = () => {
    if (activeVersion) {
      onDownload(activeVersion.id);
      handleMenuClose();
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompare(selectedVersions[0], selectedVersions[1]);
    }
  };

  const getVersionLabel = (version) => {
    if (version.isLatest) return 'Current Version';
    if (version.isOriginal) return 'Original Version';
    return `Version ${version.versionNumber}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon />
            <Typography variant="h6">Version History</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            {document?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select up to two versions to compare changes
          </Typography>
        </Box>

        {selectedVersions.length === 2 && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body2">
              2 versions selected
            </Typography>
            <Button
              variant="contained"
              color="inherit"
              size="small"
              startIcon={<CompareIcon />}
              onClick={handleCompare}
              sx={{ color: 'primary.main' }}
            >
              Compare Versions
            </Button>
          </Box>
        )}

        <List>
          {versions.map((version, index) => (
            <React.Fragment key={version.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                button
                selected={selectedVersions.includes(version.id)}
                onClick={() => handleVersionClick(version)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon>
                  <Tooltip title={getVersionLabel(version)}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: version.isLatest ? 'primary.main' : 'action.selected',
                        color: version.isLatest ? 'primary.contrastText' : 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'medium'
                      }}
                    >
                      {version.versionNumber}
                    </Box>
                  </Tooltip>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {version.updatedBy}
                      </Typography>
                      {version.isLatest && (
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.5,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            borderRadius: 1
                          }}
                        >
                          Current
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDistanceToNow(new Date(version.updatedAt), { addSuffix: true })}
                        {' • '}
                        {format(new Date(version.updatedAt), 'MMM d, yyyy h:mm a')}
                      </Typography>
                      {version.comment && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {version.comment}
                        </Typography>
                      )}
                    </Box>
                  }
                  sx={{ pr: 2 }}
                />

                <IconButton
                  edge="end"
                  onClick={(e) => handleMenuOpen(e, version)}
                  disabled={selectedVersions.length === 2}
                >
                  <MoreIcon />
                </IconButton>
              </ListItem>
            </React.Fragment>
          ))}
        </List>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleRestore}>
            <ListItemIcon>
              <RestoreIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Restore this version</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        </Menu>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVersionHistory;
