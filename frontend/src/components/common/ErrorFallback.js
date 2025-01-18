import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  useTheme
} from '@mui/material';
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const ErrorFallback = ({
  error,
  resetErrorBoundary,
  message,
  showHomeButton = true,
  showRefreshButton = true,
  variant = 'default'
}) => {
  const theme = useTheme();

  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const content = (
    <>
      <WarningIcon
        sx={{
          fontSize: 64,
          color: theme.palette.warning.main,
          mb: 2
        }}
      />
      <Typography variant="h5" gutterBottom>
        {message || 'Something went wrong'}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        sx={{ maxWidth: 'sm', mb: 3 }}
      >
        {error?.message || 'Please try again or contact support if the problem persists.'}
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        {showRefreshButton && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        )}
        {showHomeButton && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            Go Home
          </Button>
        )}
      </Box>
    </>
  );

  if (variant === 'minimal') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={3}
      >
        {content}
      </Box>
    );
  }

  if (variant === 'fullScreen') {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            {content}
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        m: 2,
        textAlign: 'center',
        borderRadius: 2
      }}
    >
      {content}
    </Paper>
  );
};

export default ErrorFallback;
