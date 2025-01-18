/**
 * Login Form Component
 * 
 * A form component for user authentication.
 * Features include:
 * - Email and password authentication
 * - Form validation
 * - Error handling
 * - Password visibility toggle
 * - Links to forgot password and registration
 * 
 * @component
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Link
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { loginSchema } from '../../validation/authSchemas';
import { login } from '../../store/slices/authSlice';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

/**
 * Login Form Component
 * 
 * @returns {JSX.Element} Login form component
 */
const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const { loading, error } = useSelector(state => state.auth);

  /**
   * Initialize form with Formik
   */
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(login(values)).unwrap();
        navigate('/dashboard');
      } catch (err) {
        // Error is handled by the reducer
      }
    }
  });

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Typography variant="h5" align="center" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Sign in to continue to e-Prabandhan
        </Typography>

        {error && (
          <ErrorAlert
            error={error}
            title="Login Failed"
            sx={{ mb: 2 }}
          />
        )}

        {/* Email field */}
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

        {/* Password field */}
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
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
                  onClick={togglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ mt: 1, mb: 2, textAlign: 'right' }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </Link>
        </Box>

        {/* Submit button */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          startIcon={<LoginIcon />}
          sx={{ mt: 2 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;
