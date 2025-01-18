import React from 'react';
import {
  Alert,
  AlertTitle,
  Collapse,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ErrorAlert = ({
  error,
  onClose,
  severity = 'error',
  title,
  autoHideDuration = 6000,
  showIcon = true,
  variant = 'filled'
}) => {
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (autoHideDuration && open) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, open]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      setTimeout(onClose, 300); // Wait for collapse animation
    }
  };

  if (!error) return null;

  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || 'An unexpected error occurred';

  return (
    <Collapse in={open}>
      <Alert
        severity={severity}
        variant={variant}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {errorMessage}
      </Alert>
    </Collapse>
  );
};

export default ErrorAlert;
