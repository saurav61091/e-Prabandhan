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
  Chip,
  Divider,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

const DocumentPreview = ({
  open,
  onClose,
  document,
  onDownload,
  onPrint,
  onShare,
  onEdit,
  onVersionHistory
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const previewRef = React.useRef(null);

  React.useEffect(() => {
    if (document?.url) {
      setLoading(true);
      setError(null);

      // Load preview based on file type
      const loadPreview = async () => {
        try {
          // Add preview loading logic here based on file type
          // For example, using PDF.js for PDFs or image loading for images
          setLoading(false);
        } catch (err) {
          setError('Failed to load preview');
          setLoading(false);
        }
      };

      loadPreview();
    }
  }, [document]);

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
      PaperProps={{
        sx: {
          height: 'calc(100vh - 64px)'
        }
      }}
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

      <Divider />

      <Box sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Chip
            label={document?.status}
            color={
              document?.status === 'approved' ? 'success' :
              document?.status === 'rejected' ? 'error' :
              document?.status === 'pending' ? 'warning' : 'default'
            }
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            Last updated {formatDistanceToNow(new Date(document?.updatedAt), { addSuffix: true })}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {document?.description}
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={1}>
          {document?.tags?.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {renderPreview()}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box display="flex" gap={1}>
          <Tooltip title="Download">
            <Button
              startIcon={<DownloadIcon />}
              onClick={onDownload}
            >
              Download
            </Button>
          </Tooltip>
          <Tooltip title="Print">
            <Button
              startIcon={<PrintIcon />}
              onClick={onPrint}
            >
              Print
            </Button>
          </Tooltip>
          <Tooltip title="Share">
            <Button
              startIcon={<ShareIcon />}
              onClick={onShare}
            >
              Share
            </Button>
          </Tooltip>
          <Tooltip title="Version History">
            <Button
              startIcon={<HistoryIcon />}
              onClick={onVersionHistory}
            >
              History
            </Button>
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              Edit
            </Button>
          </Tooltip>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreview;
