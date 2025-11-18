import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from './useRequireAuth';
import { AuthProvider } from '@/lib/AuthContext';
import { mockAuthStateChange, mockUser, resetAuthMocks } from '__mocks__/firebase/auth';

// Mock the router
vi.mock('next/navigation');

describe('useRequireAuth', () => {
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

  it('should return loading state initially', async () => {
    const { result } = renderHook(() => useRequireAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Initially should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('should redirect to /signin when user is not authenticated', async () => {
    const { result } = renderHook(() => useRequireAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPush).toHaveBeenCalledWith('/signin');
    expect(result.current.user).toBe(null);
  });

  it('should redirect to custom path when specified', async () => {
    const { result } = renderHook(() => useRequireAuth('/custom-login'), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPush).toHaveBeenCalledWith('/custom-login');
  });

  it('should not redirect when user is authenticated', async () => {
    const { result } = renderHook(() => useRequireAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the redirect call from unauthenticated state
    mockPush.mockClear();

    // Simulate user sign in
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.user?.uid).toBe(mockUser.uid);
    expect(result.current.user?.email).toBe(mockUser.email);
  });

  it('should return user data when authenticated', async () => {
    const { result } = renderHook(() => useRequireAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate user sign in
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    expect(result.current.user?.uid).toBe(mockUser.uid);
    expect(result.current.user?.email).toBe(mockUser.email);
    expect(result.current.user?.displayName).toBe(mockUser.displayName);
    expect(result.current.user?.photoURL).toBe(mockUser.photoURL);
  });

  it('should provide signOut function', async () => {
    const { result } = renderHook(() => useRequireAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.signOut).toBe('function');
  });

  it('should redirect when authenticated user signs out', async () => {
    const { result } = renderHook(() => useRequireAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Sign in user
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    // Clear previous redirect calls
    mockPush.mockClear();

    // Sign out user
    act(() => {
      mockAuthStateChange(null);
    });

    await waitFor(() => {
      expect(result.current.user).toBe(null);
    });

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('should handle multiple redirect paths correctly', async () => {
    const customPath = '/admin/login';
    const { result } = renderHook(() => useRequireAuth(customPath), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPush).toHaveBeenCalledWith(customPath);
  });

  it('should not redirect multiple times for the same state', async () => {
    const { result } = renderHook(() => useRequireAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPush).toHaveBeenCalledWith('/signin');
    expect(mockPush).toHaveBeenCalledTimes(1);

    // Wait a bit more to ensure no additional redirects
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid auth state changes', async () => {
    const { result } = renderHook(() => useRequireAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Sign in
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    // Clear redirect calls
    mockPush.mockClear();

    // Sign out
    act(() => {
      mockAuthStateChange(null);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });

    mockPush.mockClear();

    // Sign in again
    act(() => {
      mockAuthStateChange(mockUser);
    });

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    // Should not redirect when authenticated
    expect(mockPush).not.toHaveBeenCalled();
  });
});
