import { vi } from 'vitest';
import type { User } from 'firebase/auth';

// Mock user data
export const mockUser: Partial<User> = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
};

export const mockUser2: Partial<User> = {
  uid: 'test-user-id-2',
  email: 'test2@example.com',
  displayName: 'Test User 2',
  photoURL: 'https://example.com/photo2.jpg',
  emailVerified: true,
};

// Mock auth state callback
let authStateCallback: ((user: User | null) => void) | null = null;

// Mock functions
export const signInWithPopup = vi.fn().mockResolvedValue({
  user: mockUser,
  providerId: 'google.com',
  operationType: 'signIn',
});

export const signOut = vi.fn().mockResolvedValue(undefined);

export const getRedirectResult = vi.fn().mockResolvedValue(null);

export const onAuthStateChanged = vi.fn((auth, callback) => {
  authStateCallback = callback;
  // Call callback asynchronously to allow checking loading state
  setTimeout(() => callback(null), 0);
  // Return unsubscribe function
  return vi.fn();
});

export const getAuth = vi.fn().mockReturnValue({
  currentUser: null,
});

export class GoogleAuthProvider {
  providerId = 'google.com';
  constructor() {
    this.providerId = 'google.com';
  }
}

// Helper function to simulate auth state changes
export const mockAuthStateChange = (user: Partial<User> | null) => {
  if (authStateCallback) {
    authStateCallback(user as User | null);
  }
};

// Helper to reset all mocks
export const resetAuthMocks = () => {
  authStateCallback = null;
  signInWithPopup.mockClear();
  signOut.mockClear();
  getRedirectResult.mockClear();
  onAuthStateChanged.mockClear();
  getAuth.mockClear();

  // Reset to default implementations
  signInWithPopup.mockResolvedValue({
    user: mockUser,
    providerId: 'google.com',
    operationType: 'signIn',
  });
  signOut.mockResolvedValue(undefined);
  getRedirectResult.mockResolvedValue(null);
  onAuthStateChanged.mockImplementation((auth, callback) => {
    authStateCallback = callback;
    setTimeout(() => callback(null), 0);
    return vi.fn();
  });
};
