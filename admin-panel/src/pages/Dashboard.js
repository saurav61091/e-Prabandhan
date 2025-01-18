import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Box,
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DocumentIcon,
  Assignment as TaskIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ color, mr: 1 }} />
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ActivityCard = ({ title, children }) => (
  <Paper sx={{ height: '100%' }}>
    <CardHeader
      title={title}
      action={
        <IconButton>
          <RefreshIcon />
        </IconButton>
      }
    />
    <CardContent>{children}</CardContent>
  </Paper>
);

const Dashboard = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Total Users"
          value="150"
          icon={PeopleIcon}
          color="primary.main"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Active Documents"
          value="45"
          icon={DocumentIcon}
          color="success.main"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Pending Tasks"
          value="23"
          icon={TaskIcon}
          color="warning.main"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <ActivityCard title="Recent Activities">
          <Typography variant="body2" color="text.secondary">
            Activity feed will be displayed here
          </Typography>
        </ActivityCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <ActivityCard title="System Status">
          <Typography variant="body2" color="text.secondary">
            System status and metrics will be displayed here
          </Typography>
        </ActivityCard>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
