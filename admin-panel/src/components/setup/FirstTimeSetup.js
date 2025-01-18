import React, { useState, useEffect } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DatabaseConfig from '../system/DatabaseConfig';
import SMTPConfig from '../system/SMTPConfig';
import { configService } from '../../services/configService';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    padding: theme.spacing(3),
  },
  stepper: {
    marginBottom: theme.spacing(4),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
  },
  button: {
    marginLeft: theme.spacing(1),
  },
  success: {
    textAlign: 'center',
    padding: theme.spacing(3),
  },
}));

const steps = ['Database Configuration', 'SMTP Configuration', 'Admin Account Setup'];

const FirstTimeSetup = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const status = await configService.checkSetupStatus();
      if (status.isConfigured) {
        setSetupComplete(true);
        window.location.href = '/admin/dashboard';
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      try {
        await configService.completeSetup();
        setSetupComplete(true);
        window.location.href = '/admin/dashboard';
      } catch (error) {
        console.error('Error completing setup:', error);
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <DatabaseConfig onComplete={handleNext} />;
      case 1:
        return <SMTPConfig onComplete={handleNext} />;
      case 2:
        return (
          <div>
            <Typography variant="h6">Admin Account Setup</Typography>
            {/* Add admin account setup form */}
          </div>
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (setupComplete) {
    return (
      <Container>
        <Paper className={classes.success}>
          <Typography variant="h5" gutterBottom>
            Setup Complete!
          </Typography>
          <Typography variant="body1">
            Redirecting to admin dashboard...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Paper className={classes.root}>
        <Typography variant="h4" gutterBottom>
          First Time Setup
        </Typography>
        
        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <div className={classes.buttons}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            className={classes.button}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            className={classes.button}
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </Paper>
    </Container>
  );
};

export default FirstTimeSetup;
