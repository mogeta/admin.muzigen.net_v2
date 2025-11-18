import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AuthGuard from './AuthGuard';
import { AuthProvider } from '@/lib/AuthContext';
import { mockAuthStateChange, mockUser, resetAuthMocks } from '__mocks__/firebase/auth';

// Mock the router
vi.mock('next/navigation');

describe('AuthGuard', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  };

  beforeEach(() => {
    resetAuthMocks();
    mockPush.mockClear();
    vi.mocked(useRouter).mockReturnValue(mockRouter);
  });

  it('should show loading state while checking authentication', () => {
    render(
      <AuthProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show custom fallback during loading if provided', () => {
    render(
      <AuthProvider>
        <AuthGuard fallback={<div>Custom Loading...</div>}>
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should redirect to /signin when user is not authenticated', async () => {
    render(
      <AuthProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to custom path when redirectTo is specified', async () => {
    render(
      <AuthProvider>
        <AuthGuard redirectTo="/custom-login">
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', async () => {
    render(
      <AuthProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Clear any redirects that happened during loading
    mockPush.mockClear();

    // Simulate user sign in
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    // Should not redirect when authenticated
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect when authenticated user signs out', async () => {
    render(
      <AuthProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Wait for loading
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Sign in user
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    // Sign out user
    act(() => {
      mockAuthStateChange(null);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render complex children when authenticated', async () => {
    render(
      <AuthProvider>
        <AuthGuard>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome to the protected dashboard</p>
            <button>Action Button</button>
          </div>
        </AuthGuard>
      </AuthProvider>
    );

    // Wait for loading
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Sign in user
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Welcome to the protected dashboard')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('should not redirect multiple times', async () => {
    render(
      <AuthProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });

    // Should only be called once
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid auth state changes correctly', async () => {
    render(
      <AuthProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Wait for initial loading
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Sign in
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    // Sign out
    act(() => {
      mockAuthStateChange(null);
    });

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    // Sign in again
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
