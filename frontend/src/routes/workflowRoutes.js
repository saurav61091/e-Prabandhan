import React from 'react';
import { Route } from 'react-router-dom';

// Import workflow components
import WorkflowTemplateList from '../components/workflow/WorkflowTemplateList';
import WorkflowTemplateForm from '../components/workflow/WorkflowTemplateForm';
import WorkflowViewer from '../components/workflow/WorkflowViewer';
import TaskInbox from '../components/workflow/TaskInbox';
import SLADashboard from '../components/workflow/SLADashboard';
import WorkflowMetricsDashboard from '../components/workflow/metrics/WorkflowMetricsDashboard';
import WorkflowNotifications from '../components/workflow/notifications/WorkflowNotifications';
import WorkflowPermissions from '../components/workflow/permissions/WorkflowPermissions';

// Import auth guard
import AuthGuard from '../components/auth/AuthGuard';

const workflowRoutes = [
  {
    path: '/workflow/templates',
    element: (
      <AuthGuard>
        <WorkflowTemplateList />
      </AuthGuard>
    )
  },
  {
    path: '/workflow/templates/new',
    element: (
      <AuthGuard>
        <WorkflowTemplateForm />
      </AuthGuard>
    )
  },
  {
    path: '/workflow/templates/:id/edit',
    element: (
      <AuthGuard>
        <WorkflowTemplateForm />
      </AuthGuard>
    )
  },
  {
    path: '/workflow/:id',
    element: (
      <AuthGuard>
        <WorkflowViewer />
      </AuthGuard>
    )
  },
  {
    path: '/workflow/tasks',
    element: (
      <AuthGuard>
        <TaskInbox />
      </AuthGuard>
    )
  },
  {
    path: '/workflow/sla',
    element: (
      <AuthGuard>
        <SLADashboard />
      </AuthGuard>
    )
  },
  {
    path: '/workflow/metrics',
    element: (
      <AuthGuard>
        <WorkflowMetricsDashboard />
      </AuthGuard>
    )
  },
  {
    path: '/workflow/notifications',
    element: (
      <AuthGuard>
        <WorkflowNotifications />
      </AuthGuard>
    )
  },
  {
    path: '/workflow/templates/:templateId/permissions',
    element: (
      <AuthGuard>
        <WorkflowPermissions />
      </AuthGuard>
    )
  }
];

export default workflowRoutes;
