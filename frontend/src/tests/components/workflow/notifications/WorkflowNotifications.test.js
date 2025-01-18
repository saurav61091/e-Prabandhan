import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../testUtils';
import WorkflowNotifications from '../../../../components/workflow/notifications/WorkflowNotifications';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

jest.mock('axios');

describe('WorkflowNotifications', () => {
  const mockNotifications = {
    rows: [
      {
        id: 1,
        title: 'Task Assigned',
        type: 'task_assigned',
        priority: 'high',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/workflow/tasks/1'
      },
      {
        id: 2,
        title: 'SLA Warning',
        type: 'sla_warning',
        priority: 'urgent',
        read: true,
        createdAt: new Date().toISOString(),
        actionUrl: '/workflow/tasks/2'
      }
    ]
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockNotifications });
    axios.put.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<WorkflowNotifications />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays notifications after loading', async () => {
    render(<WorkflowNotifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Task Assigned')).toBeInTheDocument();
      expect(screen.getByText('SLA Warning')).toBeInTheDocument();
    });
  });

  it('handles tab switching', async () => {
    render(<WorkflowNotifications />);

    await waitFor(() => {
      const unreadTab = screen.getByText('Unread');
      fireEvent.click(unreadTab);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/workflow-notifications', {
        params: expect.objectContaining({
          unreadOnly: true
        })
      });
    });
  });

  it('marks notification as read', async () => {
    render(<WorkflowNotifications />);

    await waitFor(() => {
      const menuButton = screen.getAllByTestId('MoreVertIcon')[0];
      fireEvent.click(menuButton);
    });

    const markAsReadOption = screen.getByText('Mark as Read');
    fireEvent.click(markAsReadOption);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/workflow-notifications/1/read');
    });
  });

  it('marks all notifications as read', async () => {
    render(<WorkflowNotifications />);

    await waitFor(() => {
      const markAllButton = screen.getByText('Mark All as Read');
      fireEvent.click(markAllButton);
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/workflow-notifications/read/all');
    });
  });

  it('filters notifications by type', async () => {
    render(<WorkflowNotifications />);

    await waitFor(() => {
      const filterButton = screen.getByTestId('FilterListIcon');
      fireEvent.click(filterButton);
    });

    const taskAssignedOption = screen.getByText('Task Assigned');
    fireEvent.click(taskAssignedOption);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/workflow-notifications', {
        params: expect.objectContaining({
          type: 'task_assigned'
        })
      });
    });
  });

  it('filters notifications by priority', async () => {
    render(<WorkflowNotifications />);

    await waitFor(() => {
      const filterButton = screen.getByTestId('FilterListIcon');
      fireEvent.click(filterButton);
    });

    const highPriorityOption = screen.getByText('High');
    fireEvent.click(highPriorityOption);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/workflow-notifications', {
        params: expect.objectContaining({
          priority: 'high'
        })
      });
    });
  });

  it('navigates to notification target on click', async () => {
    const navigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigate
    }));

    render(<WorkflowNotifications />);

    await waitFor(() => {
      const notification = screen.getByText('Task Assigned');
      fireEvent.click(notification);
    });

    expect(navigate).toHaveBeenCalledWith('/workflow/tasks/1');
  });

  it('loads more notifications on scroll', async () => {
    render(<WorkflowNotifications />);

    await waitFor(() => {
      const loadMoreButton = screen.getByText('Load More');
      fireEvent.click(loadMoreButton);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/workflow-notifications', {
        params: expect.objectContaining({
          offset: 10
        })
      });
    });
  });

  it('displays error state on API failure', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<WorkflowNotifications />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch notifications')).toBeInTheDocument();
    });
  });
});
