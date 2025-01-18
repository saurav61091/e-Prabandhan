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
  Link,
  Grid,
  MenuItem
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as RegisterIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { registerSchema } from '../../validation/authSchemas';
import { register } from '../../store/slices/authSlice';
import FormError from '../common/FormError';
import ErrorAlert from '../common/ErrorAlert';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { loading, error } = useSelector(state => state.auth);
  const departments = useSelector(state => state.department.departments);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      phone: ''
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(register(values)).unwrap();
        navigate('/login', { state: { registered: true } });
      } catch (err) {
        // Error is handled by the reducer
      }
    }
  });

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Typography variant="h5" align="center" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Join e-Prabandhan to manage documents efficiently
        </Typography>

        {error && (
          <ErrorAlert
            error={error}
            title="Registration Failed"
            sx={{ mb: 2 }}
          />
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="username"
              name="username"
              label="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="department"
              name="department"
              label="Department"
              select
              value={formik.values.department}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.department && Boolean(formik.errors.department)}
              helperText={formik.touched.department && formik.errors.department}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Phone Number"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />
          </Grid>
        </Grid>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          startIcon={<RegisterIcon />}
          sx={{ mt: 3 }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RegisterForm;
