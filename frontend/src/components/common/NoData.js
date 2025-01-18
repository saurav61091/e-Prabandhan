import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import {
  InboxOutlined as InboxIcon,
  Add as AddIcon
} from '@mui/icons-material';

const NoData = ({
  message = 'No data found',
  description,
  actionLabel,
  onAction,
  icon: CustomIcon,
  variant = 'default'
}) => {
  const Icon = CustomIcon || InboxIcon;

  const content = (
    <>
      <Icon
        sx={{
          fontSize: 64,
          color: 'text.secondary',
          mb: 2
        }}
      />
      <Typography
        variant="h6"
        color="text.primary"
        gutterBottom
      >
        {message}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ maxWidth: 'sm', mb: 3 }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
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
        textAlign="center"
      >
        {content}
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        bgcolor: 'background.default',
        borderRadius: 2,
        minHeight: 300
      }}
    >
      {content}
    </Paper>
  );
};

export default NoData;
