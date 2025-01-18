import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
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

const DatabaseConfig = () => {
  const classes = useStyles();
  const [config, setConfig] = useState({
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    ssl: false,
    maxConnections: '10',
    timezone: 'UTC',
  });

  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Load existing configuration
    const loadConfig = async () => {
      try {
        const dbConfig = await configService.getDatabaseConfig();
        setConfig(dbConfig);
      } catch (error) {
        toast.error('Failed to load database configuration');
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
      await configService.updateDatabaseConfig(config);
      toast.success('Database configuration updated successfully');
    } catch (error) {
      toast.error('Failed to update database configuration');
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      await configService.testDatabaseConnection(config);
      toast.success('Database connection successful');
    } catch (error) {
      toast.error('Database connection failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Paper className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        Database Configuration
      </Typography>
      
      <form className={classes.form} onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Host"
              name="host"
              value={config.host}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Port"
              name="port"
              value={config.port}
              onChange={handleChange}
              required
              type="number"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Database Name"
              name="database"
              value={config.database}
              onChange={handleChange}
              required
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
              label="Max Connections"
              name="maxConnections"
              value={config.maxConnections}
              onChange={handleChange}
              type="number"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Timezone"
              name="timezone"
              value={config.timezone}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.ssl}
                  onChange={handleChange}
                  name="ssl"
                  color="primary"
                />
              }
              label="Enable SSL"
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
            onClick={testConnection}
            disabled={testing}
            className={classes.testButton}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </form>
    </Paper>
  );
};

export default DatabaseConfig;
