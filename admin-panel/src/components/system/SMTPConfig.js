import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { configService } from '../../services/configService';
import { toast } from 'react-toastify';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  testButton: {
    marginLeft: theme.spacing(2),
  },
}));

const SMTPConfig = () => {
  const classes = useStyles();
  const [config, setConfig] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    secure: true,
    fromName: '',
    fromEmail: '',
    encryption: 'TLS',
    authMethod: 'LOGIN',
  });

  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Load existing configuration
    const loadConfig = async () => {
      try {
        const smtpConfig = await configService.getSMTPConfig();
        setConfig(smtpConfig);
      } catch (error) {
        toast.error('Failed to load SMTP configuration');
      }
    };
    loadConfig();
  }, []);

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setConfig((prev) => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await configService.updateSMTPConfig(config);
      toast.success('SMTP configuration updated successfully');
    } catch (error) {
      toast.error('Failed to update SMTP configuration');
    }
  };

  const testSMTP = async () => {
    setTesting(true);
    try {
      await configService.testSMTPConnection(config);
      toast.success('SMTP test email sent successfully');
    } catch (error) {
      toast.error('SMTP test failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Paper className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        SMTP Configuration
      </Typography>
      
      <form className={classes.form} onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SMTP Host"
              name="host"
              value={config.host}
              onChange={handleChange}
              required
              helperText="e.g., smtp.gmail.com"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SMTP Port"
              name="port"
              value={config.port}
              onChange={handleChange}
              required
              type="number"
              helperText="e.g., 587 for TLS, 465 for SSL"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={config.username}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              value={config.password}
              onChange={handleChange}
              type="password"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="From Name"
              name="fromName"
              value={config.fromName}
              onChange={handleChange}
              required
              helperText="Display name for sent emails"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="From Email"
              name="fromEmail"
              value={config.fromEmail}
              onChange={handleChange}
              required
              type="email"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Encryption</InputLabel>
              <Select
                name="encryption"
                value={config.encryption}
                onChange={handleChange}
              >
                <MenuItem value="TLS">TLS</MenuItem>
                <MenuItem value="SSL">SSL</MenuItem>
                <MenuItem value="STARTTLS">STARTTLS</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Authentication Method</InputLabel>
              <Select
                name="authMethod"
                value={config.authMethod}
                onChange={handleChange}
              >
                <MenuItem value="LOGIN">LOGIN</MenuItem>
                <MenuItem value="PLAIN">PLAIN</MenuItem>
                <MenuItem value="CRAM-MD5">CRAM-MD5</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.secure}
                  onChange={handleChange}
                  name="secure"
                  color="primary"
                />
              }
              label="Enable Secure Connection"
            />
          </Grid>
        </Grid>

        <div className={classes.submitButton}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            Save Configuration
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            onClick={testSMTP}
            disabled={testing}
            className={classes.testButton}
          >
            {testing ? 'Sending Test Email...' : 'Send Test Email'}
          </Button>
        </div>
      </form>
    </Paper>
  );
};

export default SMTPConfig;
