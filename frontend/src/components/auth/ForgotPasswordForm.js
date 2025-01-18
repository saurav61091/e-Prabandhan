import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  Alert
} from '@mui/material';
import {
  Email as EmailIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { forgotPasswordSchema } from '../../validation/authSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const ForgotPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [success, setSuccess] = React.useState(false);
  const { loading, error } = useSelector(state => state.auth);

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        // Replace with your forgot password action
        // await dispatch(forgotPassword(values)).unwrap();
        setSuccess(true);
      } catch (err) {
        // Error is handled by the reducer
      }
    }
  });

  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
        <Box textAlign="center">
          <EmailIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Check Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We've sent password reset instructions to your email address.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Didn't receive the email? Check your spam folder or{' '}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => setSuccess(false)}
            >
              try again
            </Link>
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Typography variant="h5" align="center" gutterBottom>
          Forgot Password?
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>

        {error && (
          <ErrorAlert
            error={error}
            title="Request Failed"
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email Address"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          margin="normal"
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          startIcon={<EmailIcon />}
          sx={{ mt: 3 }}
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </Button>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ForgotPasswordForm;
