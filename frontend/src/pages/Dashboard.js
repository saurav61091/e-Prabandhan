import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  FlightTakeoff as FlightTakeoffIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import FileManager from '../components/FileManager';
import TaskManager from '../components/TaskManager';
import Analytics from '../components/Analytics';
import NotificationCenter from '../components/NotificationCenter';
import LeaveList from '../components/LeaveList';
import TourList from '../components/TourList';
import LeaveApproval from '../components/LeaveApproval';
import TourApproval from '../components/TourApproval';
import { useAuth } from '../contexts/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

export default function Dashboard() {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const isManager = user?.role === 'admin' || user?.role === 'supervisor';

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 2 }}>
        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            aria-label="dashboard tabs"
          >
            <Tab
              icon={<DescriptionIcon />}
              label={isMobile ? "" : "Files"}
              {...a11yProps(0)}
            />
            <Tab
              icon={<AssignmentIcon />}
              label={isMobile ? "" : "Tasks"}
              {...a11yProps(1)}
            />
            <Tab
              icon={<TimelineIcon />}
              label={isMobile ? "" : "Analytics"}
              {...a11yProps(2)}
            />
            <Tab
              icon={<NotificationsIcon />}
              label={isMobile ? "" : "Notifications"}
              {...a11yProps(3)}
            />
            <Tab
              icon={<EventAvailableIcon />}
              label={isMobile ? "" : "Leave"}
              {...a11yProps(4)}
            />
            <Tab
              icon={<FlightTakeoffIcon />}
              label={isMobile ? "" : "Tour"}
              {...a11yProps(5)}
            />
          </Tabs>
        </Paper>

        <TabPanel value={value} index={0}>
          <FileManager />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TaskManager />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Analytics />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <NotificationCenter />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={isManager ? 6 : 12}>
              <LeaveList />
            </Grid>
            {isManager && (
              <Grid item xs={12} md={6}>
                <LeaveApproval />
              </Grid>
            )}
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={isManager ? 6 : 12}>
              <TourList />
            </Grid>
            {isManager && (
              <Grid item xs={12} md={6}>
                <TourApproval />
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
}
