import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log the error to your error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReportError = () => {
    // Implement error reporting logic here
    const errorReport = {
      error: this.state.error?.toString(),
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    console.log('Error report:', errorReport);
    // You can send this to your error reporting service
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mt: 4,
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            <ErrorIcon
              color="error"
              sx={{ fontSize: 64, mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Box
                sx={{
                  mt: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                <Typography variant="body2" component="pre">
                  {this.state.error?.toString()}
                </Typography>
                <Typography variant="body2" component="pre">
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleReportError}
              >
                Report Error
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
