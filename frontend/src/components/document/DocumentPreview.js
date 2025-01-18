/**
 * Document Preview Component
 * 
 * A modal component that displays document preview and details.
 * Features include:
 * - Document content preview
 * - Metadata display
 * - Version history
 * - Comments section
 * - Action buttons
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import DocumentViewer from './DocumentViewer';
import CommentsSection from './CommentsSection';
import VersionHistory from './VersionHistory';
import { downloadDocument } from '../../store/slices/documentSlice';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * TabPanel Component for Document Preview tabs
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Current tab value
 * @param {number} props.index - Tab index
 * @param {ReactNode} props.children - Tab content
 */
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-preview-tabpanel-${index}`}
      aria-labelledby={`document-preview-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Document Preview Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.document - Document object to preview
 * @param {boolean} props.open - Dialog open state
 * @param {function} props.onClose - Dialog close handler
 * @param {function} props.onEdit - Edit document handler
 * @param {function} props.onShare - Share document handler
 */
const DocumentPreview = ({
  document,
  open,
  onClose,
  onEdit,
  onShare,
  onDownload,
  onPrint,
  onVersionHistory
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { canEdit, canShare } = usePermissions();

  /**
   * Load document preview
   */
  useEffect(() => {
    if (document && open) {
      setLoading(true);
      setError(null);
      // Load preview content
      loadDocumentPreview(document.id)
        .then(() => setLoading(false))
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [document, open]);

  /**
   * Handle tab change
   * @param {Object} event - Change event
   * @param {number} newValue - New tab index
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  /**
   * Handle document download
   */
  const handleDownload = async () => {
    try {
      await dispatch(downloadDocument(document.id)).unwrap();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  /**
   * Get status chip color based on document status
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

  const getFileIcon = () => {
    if (!document?.fileType) return <DocumentIcon />;
    
    if (document.fileType.includes('pdf')) {
      return <PdfIcon />;
    } else if (document.fileType.includes('image')) {
      return <ImageIcon />;
    }
    return <DocumentIcon />;
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight={400}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight={400}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    // Render preview based on file type
    if (document?.fileType?.includes('image')) {
      return (
        <Box
          component="img"
          src={document.url}
          alt={document.title}
          sx={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 300px)',
            objectFit: 'contain'
          }}
        />
      );
    }

    // PDF preview container
    if (document?.fileType?.includes('pdf')) {
      return (
        <Box
          ref={previewRef}
          sx={{
            width: '100%',
            height: 'calc(100vh - 300px)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        />
      );
    }

    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={400}
      >
        <Typography>Preview not available</Typography>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {getFileIcon()}
            <Typography variant="h6" component="span">
              {document?.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Document metadata */}
            <Box mb={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Chip
                    label={document.status}
                    color={getStatusColor()}
                    size="small"
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Last updated {formatDistanceToNow(new Date(document.updatedAt))} ago
                  </Typography>
                </Grid>
                {document.tags?.map(tag => (
                  <Grid item key={tag}>
                    <Chip label={tag} size="small" variant="outlined" />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider />

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Preview" />
                <Tab label="Comments" />
                <Tab label="Version History" />
              </Tabs>
            </Box>

            {/* Preview tab */}
            <TabPanel value={activeTab} index={0}>
              {renderPreview()}
            </TabPanel>

            {/* Comments tab */}
            <TabPanel value={activeTab} index={1}>
              <CommentsSection documentId={document.id} />
            </TabPanel>

            {/* Version history tab */}
            <TabPanel value={activeTab} index={2}>
              <VersionHistory documentId={document.id} />
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<DownloadIcon />}
          onClick={onDownload}
        >
          Download
        </Button>
        <Button
          startIcon={<PrintIcon />}
          onClick={onPrint}
        >
          Print
        </Button>
        <Button
          startIcon={<ShareIcon />}
          onClick={onShare}
        >
          Share
        </Button>
        <Button
          startIcon={<HistoryIcon />}
          onClick={onVersionHistory}
        >
          History
        </Button>
        {canEdit && (
          <Button
            startIcon={<EditIcon />}
            onClick={onEdit}
            color="primary"
          >
            Edit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

DocumentPreview.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string)
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onShare: PropTypes.func,
  onDownload: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
  onVersionHistory: PropTypes.func.isRequired
};

export default DocumentPreview;
