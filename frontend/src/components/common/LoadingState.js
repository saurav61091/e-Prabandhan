import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Fade
} from '@mui/material';

const LoadingState = ({
  message = 'Loading...',
  fullScreen = false,
  delay = 500,
  size = 40,
  variant = 'default'
}) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) {
    return null;
  }

  const renderContent = () => (
    <Fade in={visible}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        p={3}
      >
        <CircularProgress size={size} />
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );

  if (variant === 'overlay') {
    return (
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.8)"
        zIndex={1000}
      >
        {renderContent()}
      </Box>
    );
  }

  if (fullScreen) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        {renderContent()}
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          width: '100%',
          maxWidth: 400,
          mx: 'auto'
        }}
      >
        {renderContent()}
      </Paper>
    );
  }

  return renderContent();
};

export default LoadingState;
