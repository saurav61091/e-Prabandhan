import React, { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const MainLayout = ({ children }) => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      fetchPendingTaskCount();
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get('/api/workflow-notifications/unread/count');
      setUnreadNotifications(response.data.count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const fetchPendingTaskCount = async () => {
    try {
      const response = await axios.get('/api/workflow/tasks/pending/count');
      setPendingTasks(response.data.count);
    } catch (error) {
      console.error('Error fetching pending task count:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar
        unreadNotifications={unreadNotifications}
        pendingTasks={pendingTasks}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          backgroundColor: 'background.default'
        }}
      >
        <Header />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
