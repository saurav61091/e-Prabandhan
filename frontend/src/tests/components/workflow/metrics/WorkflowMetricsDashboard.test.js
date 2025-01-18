import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../testUtils';
import WorkflowMetricsDashboard from '../../../../components/workflow/metrics/WorkflowMetricsDashboard';
import axios from 'axios';

jest.mock('axios');

describe('WorkflowMetricsDashboard', () => {
  const mockMetricsData = {
    overview: {
      totalWorkflows: 100,
      completedWorkflows: 75,
      activeWorkflows: 25,
    },
    slaCompliance: {
      totalBreaches: 5,
      breachesByDepartment: {
        'HR': 2,
        'Finance': 3
      }
    },
    performance: {
      completionRateByTemplate: {
        'Template1': 85,
        'Template2': 92
      },
      averageWorkflowDuration: 48,
      averageTaskDuration: 8
    }
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockMetricsData });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<WorkflowMetricsDashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays metrics data after loading', async () => {
    render(<WorkflowMetricsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // Total Workflows
      expect(screen.getByText('75')).toBeInTheDocument(); // Completed Workflows
      expect(screen.getByText('25')).toBeInTheDocument(); // Active Workflows
      expect(screen.getByText('5')).toBeInTheDocument(); // SLA Breaches
    });
  });

  it('updates date range filter', async () => {
    render(<WorkflowMetricsDashboard />);

    const startDatePicker = screen.getByLabelText('Start Date');
    const endDatePicker = screen.getByLabelText('End Date');

    fireEvent.change(startDatePicker, { target: { value: '2025-01-01' } });
    fireEvent.change(endDatePicker, { target: { value: '2025-01-31' } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/workflow-metrics/dashboard', {
        params: expect.objectContaining({
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        })
      });
    });
  });

  it('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<WorkflowMetricsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load metrics')).toBeInTheDocument();
    });
  });

  it('displays charts with correct data', async () => {
    render(<WorkflowMetricsDashboard />);

    await waitFor(() => {
      // Check for chart titles
      expect(screen.getByText('Workflow Completion Rate')).toBeInTheDocument();
      expect(screen.getByText('SLA Breaches by Department')).toBeInTheDocument();
      expect(screen.getByText('Average Duration Trends')).toBeInTheDocument();
    });
  });

  it('allows template filtering', async () => {
    render(<WorkflowMetricsDashboard />);

    const templateSelect = screen.getByLabelText('Template');
    fireEvent.change(templateSelect, { target: { value: 'Template1' } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/workflow-metrics/dashboard', {
        params: expect.objectContaining({
          templateId: 'Template1'
        })
      });
    });
  });
});
