import React from 'react';
import { render, screen } from '../../testUtils';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { Navigate } from 'react-router-dom';

jest.mock('../../../contexts/AuthContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn()
}));

describe('ProtectedRoute', () => {
  const mockChild = <div>Protected Content</div>;

  beforeEach(() => {
    Navigate.mockImplementation(() => null);
  });

  it('renders children when user is authenticated', () => {
    useAuth.mockReturnValue({ user: { id: '1', name: 'Test User' } });

    render(<ProtectedRoute>{mockChild}</ProtectedRoute>);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(Navigate).not.toHaveBeenCalled();
  });

  it('redirects to login when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null });

    render(<ProtectedRoute>{mockChild}</ProtectedRoute>);
    
    expect(Navigate).toHaveBeenCalledWith({ to: '/login', replace: true }, {});
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
