import React from 'react';
import { render, screen, fireEvent } from '../../testUtils';
import ErrorBoundary from '../../../components/common/ErrorBoundary';

describe('ErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  beforeEach(() => {
    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Report Error')).toBeInTheDocument();
  });

  it('shows error details in development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('handles retry action', () => {
    const ErrorComponent = () => {
      const [shouldError, setShouldError] = React.useState(true);
      
      if (shouldError) {
        throw new Error('Test error');
      }

      return <div>Recovered</div>;
    };

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });

  it('handles report error action', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const reportButton = screen.getByText('Report Error');
    fireEvent.click(reportButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error report:',
      expect.objectContaining({
        error: expect.any(String),
        componentStack: expect.any(String),
        timestamp: expect.any(String),
        url: expect.any(String)
      })
    );

    consoleSpy.mockRestore();
  });
});
