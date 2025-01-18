import React from 'react';
import { render, screen, act } from '../../testUtils';
import LoadingState from '../../../components/common/LoadingState';

describe('LoadingState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not show loading state immediately', () => {
    render(<LoadingState />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows loading state after delay', () => {
    render(<LoadingState />);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows custom message', () => {
    render(<LoadingState message="Custom loading message" />);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('renders fullscreen variant', () => {
    render(<LoadingState fullScreen />);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });

    const container = screen.getByRole('progressbar').parentElement.parentElement;
    expect(container).toHaveStyle({ minHeight: '100vh' });
  });

  it('renders overlay variant', () => {
    render(<LoadingState variant="overlay" />);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });

    const container = screen.getByRole('progressbar').parentElement.parentElement;
    expect(container).toHaveStyle({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    });
  });

  it('renders card variant', () => {
    render(<LoadingState variant="card" />);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });

    const container = screen.getByRole('progressbar').closest('.MuiPaper-root');
    expect(container).toBeInTheDocument();
  });

  it('uses custom delay', () => {
    render(<LoadingState delay={1000} />);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('uses custom size', () => {
    render(<LoadingState size={60} />);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });

    const spinner = screen.getByRole('progressbar');
    expect(spinner).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('cleans up timer on unmount', () => {
    const { unmount } = render(<LoadingState />);
    
    unmount();
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
