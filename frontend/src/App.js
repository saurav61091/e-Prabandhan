import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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

function App() {
  return (
    <ErrorBoundary>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Box sx={{ display: 'flex' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                {/* File Management Routes */}
                <Route path="/files" element={
                  <ProtectedRoute>
                    <FileList />
                  </ProtectedRoute>
                } />
                <Route path="/files/upload" element={
                  <ProtectedRoute>
                    <FileUpload />
                  </ProtectedRoute>
                } />
                <Route path="/files/:id" element={
                  <ProtectedRoute>
                    <FileDetails />
                  </ProtectedRoute>
                } />
                <Route path="/files/batch" element={
                  <ProtectedRoute>
                    <BatchOperations />
                  </ProtectedRoute>
                } />
                {/* Task Routes */}
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <TaskList />
                  </ProtectedRoute>
                } />
                <Route path="/tasks/new" element={
                  <ProtectedRoute>
                    <TaskForm />
                  </ProtectedRoute>
                } />
                <Route path="/tasks/:id/edit" element={
                  <ProtectedRoute>
                    <TaskForm />
                  </ProtectedRoute>
                } />
                {/* Workflow Routes */}
                <Route path="/workflow/templates" element={
                  <ProtectedRoute>
                    <WorkflowTemplateList />
                  </ProtectedRoute>
                } />
                <Route path="/workflow/templates/new" element={
                  <ProtectedRoute>
                    <WorkflowTemplateForm />
                  </ProtectedRoute>
                } />
                <Route path="/workflow/templates/:id/edit" element={
                  <ProtectedRoute>
                    <WorkflowTemplateForm />
                  </ProtectedRoute>
                } />
                <Route path="/workflow/templates/:templateId/permissions" element={
                  <ProtectedRoute>
                    <WorkflowPermissions />
                  </ProtectedRoute>
                } />
                <Route path="/workflow/:id" element={
                  <ProtectedRoute>
                    <WorkflowViewer />
                  </ProtectedRoute>
                } />
                <Route path="/workflow/new" element={
                  <ProtectedRoute>
                    <WorkflowForm />
                  </ProtectedRoute>
                } />
                <Route path="/workflow/:id/edit" element={
                  <ProtectedRoute>
                    <WorkflowForm />
                  </ProtectedRoute>
                } />
                <Route path="/workflow/metrics" element={
                  <ProtectedRoute>
                    <WorkflowMetricsDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/workflow/notifications" element={
                  <ProtectedRoute>
                    <WorkflowNotifications />
                  </ProtectedRoute>
                } />
                {/* Settings Routes */}
                <Route path="/settings/notifications" element={
                  <ProtectedRoute>
                    <NotificationPreferences />
                  </ProtectedRoute>
                } />
                <Route path="/settings/retention" element={
                  <ProtectedRoute>
                    <RetentionPolicyManager />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </Box>
        </SnackbarProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
}

export default App;
