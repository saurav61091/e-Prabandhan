import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import axios from 'axios';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FilePreview = ({ fileId, onClose }) => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPreview();
  }, [fileId]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/files/${fileId}/preview`, {
        responseType: 'blob'
      });
      
      const contentType = response.headers['content-type'];
      const previewUrl = URL.createObjectURL(response.data);
      
      setPreviewData({
        type: contentType,
        url: previewUrl
      });
    } catch (error) {
      console.error('Error fetching preview:', error);
      setError('Error loading preview');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/files/${fileId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ''); // browser will detect filename from response
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handlePrint = () => {
    if (previewData?.url) {
      const printWindow = window.open(previewData.url);
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const renderPreview = () => {
    if (!previewData) return null;

    switch (previewData.type) {
      case 'application/pdf':
        return (
          <Document
            file={previewData.url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<CircularProgress />}
          >
            <Page
              pageNumber={currentPage}
              scale={zoom}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
            {numPages > 1 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography>
                  Page {currentPage} of {numPages}
                </Typography>
                <Button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  disabled={currentPage >= numPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </Box>
            )}
          </Document>
        );

      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return (
          <img
            src={previewData.url}
            alt="File preview"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          />
        );

      case 'text/plain':
      case 'text/csv':
      case 'application/json':
      case 'text/xml':
        return (
          <Paper
            sx={{
              p: 2,
              maxHeight: '80vh',
              overflow: 'auto',
              fontSize: `${14 * zoom}px`
            }}
          >
            <pre>{previewData.content}</pre>
          </Paper>
        );

      default:
        return (
          <Typography color="error">
            Preview not available for this file type
          </Typography>
        );
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">File Preview</Typography>
          <Box>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
            sx={{ overflowY: 'auto', height: '100%' }}
          >
            {renderPreview()}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;
