import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../testUtils';
import WorkflowPermissions from '../../../../components/workflow/permissions/WorkflowPermissions';
import axios from 'axios';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ templateId: '123' })
}));

describe('WorkflowPermissions', () => {
  const mockPermissions = [
    {
      id: 1,
      entityType: 'user',
      entityId: 'user1',
      permissions: {
        view: true,
        edit: true,
        delete: false
      },
      priority: 1,
      conditions: {
        fileTypes: ['pdf'],
        departments: ['HR']
      }
    },
    {
      id: 2,
      entityType: 'role',
      entityId: 'role1',
      permissions: {
        view: true,
        edit: false,
        delete: false
      },
      priority: 2,
      conditions: {}
    }
  ];

  const mockUsers = [
    { id: 'user1', name: 'John Doe' },
    { id: 'user2', name: 'Jane Smith' }
  ];

  const mockRoles = [
    { id: 'role1', name: 'Admin' },
    { id: 'role2', name: 'User' }
  ];

  const mockDepartments = [
    { id: 'dept1', name: 'HR' },
    { id: 'dept2', name: 'Finance' }
  ];

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/workflow-permissions/templates')) {
        return Promise.resolve({ data: mockPermissions });
      }
      if (url.includes('/users')) {
        return Promise.resolve({ data: mockUsers });
      }
      if (url.includes('/roles')) {
        return Promise.resolve({ data: mockRoles });
      }
      if (url.includes('/departments')) {
        return Promise.resolve({ data: mockDepartments });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<WorkflowPermissions />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays permissions after loading', async () => {
    render(<WorkflowPermissions />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('opens add permission dialog', async () => {
    render(<WorkflowPermissions />);

    await waitFor(() => {
      const addButton = screen.getByText('Add Permission');
      fireEvent.click(addButton);
    });

    expect(screen.getByText('Add Permission')).toBeInTheDocument();
    expect(screen.getByText('Entity Type')).toBeInTheDocument();
  });

  it('creates new permission', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<WorkflowPermissions />);

    await waitFor(() => {
      const addButton = screen.getByText('Add Permission');
      fireEvent.click(addButton);
    });

    // Fill form
    const entityTypeSelect = screen.getByLabelText('Entity Type');
    fireEvent.change(entityTypeSelect, { target: { value: 'user' } });

    const entitySelect = screen.getByLabelText('Entity');
    fireEvent.change(entitySelect, { target: { value: 'user1' } });

    const priorityInput = screen.getByLabelText('Priority');
    fireEvent.change(priorityInput, { target: { value: '1' } });

    const viewPermission = screen.getByLabelText('View');
    fireEvent.click(viewPermission);

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/workflow-permissions', expect.any(Object));
    });
  });

  it('edits existing permission', async () => {
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    render(<WorkflowPermissions />);

    await waitFor(() => {
      const editButtons = screen.getAllByTestId('EditIcon');
      fireEvent.click(editButtons[0]);
    });

    const priorityInput = screen.getByLabelText('Priority');
    fireEvent.change(priorityInput, { target: { value: '3' } });

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/workflow-permissions/1', expect.any(Object));
    });
  });

  it('deletes permission', async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    render(<WorkflowPermissions />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/workflow-permissions/1');
    });
  });

  it('copies permissions to another template', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<WorkflowPermissions />);

    await waitFor(() => {
      const copyButton = screen.getByText('Copy Permissions');
      fireEvent.click(copyButton);
    });

    const templateSelect = screen.getByLabelText('Target Template');
    fireEvent.change(templateSelect, { target: { value: 'template2' } });

    const confirmButton = screen.getByText('Copy');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/workflow-permissions/copy', {
        sourceTemplateId: '123',
        targetTemplateId: 'template2'
      });
    });
  });

  it('displays error state on API failure', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(<WorkflowPermissions />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch permissions')).toBeInTheDocument();
    });
  });

  it('validates form inputs', async () => {
    render(<WorkflowPermissions />);

    await waitFor(() => {
      const addButton = screen.getByText('Add Permission');
      fireEvent.click(addButton);
    });

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    expect(screen.getByText('Entity is required')).toBeInTheDocument();
  });

  it('filters entities based on entity type', async () => {
    render(<WorkflowPermissions />);

    await waitFor(() => {
      const addButton = screen.getByText('Add Permission');
      fireEvent.click(addButton);
    });

    const entityTypeSelect = screen.getByLabelText('Entity Type');
    
    // Switch to users
    fireEvent.change(entityTypeSelect, { target: { value: 'user' } });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Switch to roles
    fireEvent.change(entityTypeSelect, { target: { value: 'role' } });
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();

    // Switch to departments
    fireEvent.change(entityTypeSelect, { target: { value: 'department' } });
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });
});
