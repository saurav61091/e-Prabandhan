import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const steps = ['Check System', 'Configure Database', 'Create Admin User'];

const SetupPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [setupStatus, setSetupStatus] = useState('checking');
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: '3306',
    username: '',
    password: '',
    database: 'eprabandhan',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
  });

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await axios.get('/api/setup/status');
      setSetupStatus(response.data.status);
      if (response.data.status === 'configured') {
        window.location.href = '/';
      }
      setLoading(false);
    } catch (error) {
      setError('Failed to check setup status');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateDatabaseForm = () => {
    const required = ['host', 'port', 'username', 'database'];
    return required.every((field) => formData[field]);
  };

  const validateAdminForm = () => {
    const required = ['adminEmail', 'adminPassword', 'adminFirstName', 'adminLastName'];
    return required.every((field) => formData[field]);
  };

  const handleDatabaseSetup = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/setup/database', {
        host: formData.host,
        port: formData.port,
        username: formData.username,
        password: formData.password,
        database: formData.database,
      });

      setActiveStep(2);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to configure database');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetup = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/setup/admin', {
        email: formData.adminEmail,
        password: formData.adminPassword,
        firstName: formData.adminFirstName,
        lastName: formData.adminLastName,
      });

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create admin user');
      setLoading(false);
    }
  };

  const renderSystemCheck = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Check
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            System requirements met
          </Alert>
          <Button
            variant="contained"
            onClick={() => setActiveStep(1)}
            disabled={setupStatus === 'error'}
          >
            Continue
          </Button>
        </>
      )}
    </Box>
  );

  const renderDatabaseSetup = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Database Configuration
      </Typography>
      <Box component="form" noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Database Host"
          name="host"
          value={formData.host}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Database Port"
          name="port"
          value={formData.port}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Database Username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Database Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Database Name"
          name="database"
          value={formData.database}
          onChange={handleInputChange}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={handleDatabaseSetup}
          disabled={!validateDatabaseForm() || loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Configure Database'}
        </Button>
      </Box>
    </Box>
  );

  const renderAdminSetup = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Create Admin User
      </Typography>
      <Box component="form" noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Admin Email"
          name="adminEmail"
          type="email"
          value={formData.adminEmail}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Admin Password"
          name="adminPassword"
          type="password"
          value={formData.adminPassword}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="First Name"
          name="adminFirstName"
          value={formData.adminFirstName}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Last Name"
          name="adminLastName"
          value={formData.adminLastName}
          onChange={handleInputChange}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={handleAdminSetup}
          disabled={!validateAdminForm() || loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Admin User'}
        </Button>
      </Box>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderSystemCheck();
      case 1:
        return renderDatabaseSetup();
      case 2:
        return renderAdminSetup();
      default:
        return 'Unknown step';
    }
  };

  if (loading && activeStep === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          e-Prabandhan Setup
        </Typography>

        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default SetupPage;
