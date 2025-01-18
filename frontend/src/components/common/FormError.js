import React from 'react';
import {
  FormHelperText,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

const FormError = ({
  error,
  variant = 'text',
  showIcon = true,
  align = 'left',
  margin = 'dense'
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || 'Invalid input';

  if (variant === 'alert') {
    return (
      <Alert
        severity="error"
        icon={showIcon ? <ErrorIcon /> : false}
        sx={{ mt: 1, mb: 1 }}
      >
        {errorMessage}
      </Alert>
    );
  }

  if (variant === 'box') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 1,
          mb: 1,
          color: 'error.main'
        }}
      >
        {showIcon && <ErrorIcon fontSize="small" />}
        <Typography
          variant="caption"
          color="error"
          align={align}
        >
          {errorMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <FormHelperText
      error
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        margin: margin === 'dense' ? '4px 0 0' : '8px 0 0',
        textAlign: align
      }}
    >
      {showIcon && <ErrorIcon fontSize="small" />}
      {errorMessage}
    </FormHelperText>
  );
};

export default FormError;
