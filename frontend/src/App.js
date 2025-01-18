/**
 * Main Application Component
 * 
 * This is the root component of the e-Prabandhan frontend application.
 * It sets up routing, theme, authentication, and global providers.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { FileList, FileUpload, FileDetails, BatchOperations } from './components/file';
import { TaskList, TaskForm } from './components/task';
import { NotificationPreferences } from './components/notification';
import { RetentionPolicyManager } from './components/retention';
import {
  WorkflowMetricsDashboard,
  WorkflowNotifications,
  WorkflowPermissions,
  WorkflowTemplateForm,
  WorkflowTemplateList,
  WorkflowViewer,
  WorkflowForm
} from './components/workflow';
import ProtectedRoute from './components/auth/ProtectedRoute';

/**
 * App Component
 * 
 * Provides the main structure of the application including:
 * - Material-UI theme provider
 * - Snackbar notifications
 * - Authentication context
 * - Routing configuration
 */
const App = () => {
  return (
    <ErrorBoundary>
      <SnackbarProvider maxSnack={3}>
        <Box sx={{ display: 'flex' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/files">
                <Route index element={<FileList />} />
                <Route path="upload" element={<FileUpload />} />
                <Route path=":fileId" element={<FileDetails />} />
                <Route path="batch" element={<BatchOperations />} />
              </Route>
              <Route path="/tasks">
                <Route index element={<TaskList />} />
                <Route path="new" element={<TaskForm />} />
                <Route path=":taskId" element={<TaskForm />} />
              </Route>
              <Route path="/workflows">
                <Route path="templates">
                  <Route index element={<WorkflowTemplateList />} />
                  <Route path="new" element={<WorkflowTemplateForm />} />
                  <Route path=":templateId" element={<WorkflowTemplateForm />} />
                </Route>
                <Route path="new" element={<WorkflowForm />} />
                <Route path=":workflowId" element={<WorkflowViewer />} />
                <Route path="metrics" element={<WorkflowMetricsDashboard />} />
                <Route path="notifications" element={<WorkflowNotifications />} />
                <Route path="permissions" element={<WorkflowPermissions />} />
              </Route>
              <Route path="/notifications/preferences" element={<NotificationPreferences />} />
              <Route path="/retention" element={<RetentionPolicyManager />} />
            </Route>
          </Routes>
        </Box>
      </SnackbarProvider>
    </ErrorBoundary>
  );
};

export default App;
