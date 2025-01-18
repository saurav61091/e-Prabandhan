import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Documents"
            value="45"
            icon={DescriptionIcon}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Tasks"
            value="12"
            icon={AssignmentIcon}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Users"
            value="28"
            icon={PeopleIcon}
            color="success.main"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityCard title="Recent Activities">
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Recent activity feed will be integrated here
              </Typography>
            </Box>
          </ActivityCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityCard title="Notifications">
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Notification center will be integrated here
              </Typography>
            </Box>
          </ActivityCard>
        </Grid>

        <Grid item xs={12}>
          <ActivityCard title="Document Analytics">
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Document analytics and charts will be integrated here
              </Typography>
            </Box>
          </ActivityCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
