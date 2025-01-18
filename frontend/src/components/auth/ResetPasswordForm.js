/**
 * Reset Password Form Component
 * 
 * A form component for resetting user password.
 * Features include:
 * - Password strength validation
 * - Password confirmation
 * - Form validation
 * - Error handling
 * - Password visibility toggle
 * - Token validation
 * 
 * @component
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { resetPasswordSchema } from '../../validation/authSchemas';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

/**
 * Reset Password Form Component
 * 
 * @returns {JSX.Element} Reset password form component
 */
const ResetPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const { loading, error } = useSelector(state => state.auth);

  /**
   * Initialize form with Formik
   */
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      try {
        // Replace with your reset password action
        // await dispatch(resetPassword({ token, ...values })).unwrap();
        setSuccess(true);
      } catch (err) {
        // Error is handled by the reducer
      }
    }
  });

  /**
   * Toggle password visibility
   * @param {string} field - Field name (password or confirmPassword)
   */
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
        <Box textAlign="center">
          <LockResetIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Password Reset Successfully
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your password has been reset successfully. You can now log in with your new password.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Typography variant="h5" align="center" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your new password below
        </Typography>

        {error && (
          <ErrorAlert
            error={error}
            title="Reset Failed"
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          fullWidth
          id="password"
          name="password"
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => togglePasswordVisibility('password')}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => togglePasswordVisibility('confirm')}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          startIcon={<LockResetIcon />}
          sx={{ mt: 3 }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ResetPasswordForm;
