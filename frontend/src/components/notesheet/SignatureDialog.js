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
  Tabs,
  Tab
} from '@mui/material';
import {
  Close as CloseIcon,
  Draw as DrawIcon,
  Upload as UploadIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import SignaturePad from 'react-signature-canvas';

const SignatureDialog = ({
  open,
  onClose,
  onSave,
  title = 'Add Signature'
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [signature, setSignature] = React.useState(null);
  const signaturePadRef = React.useRef(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    clearSignature();
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setSignature(null);
  };

  const handleDraw = () => {
    if (signaturePadRef.current) {
      const dataUrl = signaturePadRef.current.toDataURL();
      setSignature(dataUrl);
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignature(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (signature) {
      onSave(signature);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {title}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab 
            icon={<DrawIcon />} 
            label="Draw" 
          />
          <Tab 
            icon={<UploadIcon />} 
            label="Upload" 
          />
        </Tabs>

        {activeTab === 0 ? (
          <Box>
            <Box
              border={1}
              borderColor="divider"
              borderRadius={1}
              bgcolor="#fff"
              height={200}
              mb={2}
            >
              <SignaturePad
                ref={signaturePadRef}
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: 'signature-canvas'
                }}
                onEnd={handleDraw}
              />
            </Box>
            <Button
              startIcon={<ClearIcon />}
              onClick={clearSignature}
              size="small"
            >
              Clear
            </Button>
          </Box>
        ) : (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center"
            gap={2}
          >
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload Signature
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleUpload}
              />
            </Button>
            {signature && (
              <Box>
                <img 
                  src={signature} 
                  alt="Uploaded signature" 
                  style={{ maxWidth: '100%', maxHeight: 200 }}
                />
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearSignature}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Clear
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!signature}
        >
          Save Signature
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureDialog;
