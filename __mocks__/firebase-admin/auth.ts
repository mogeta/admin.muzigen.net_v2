import { vi } from 'vitest';

export const mockDecodedToken = {
  uid: 'test-user-id',
  email: 'test@example.com',
  email_verified: true,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  aud: 'test-project',
  iss: 'https://securetoken.google.com/test-project',
  sub: 'test-user-id',
};

export const verifyIdToken = vi.fn().mockResolvedValue(mockDecodedToken);

export const getAuth = vi.fn().mockReturnValue({
  verifyIdToken,
});

// Helper to reset all mocks
export const resetAuthAdminMocks = () => {
  verifyIdToken.mockClear();
  getAuth.mockClear();

  verifyIdToken.mockResolvedValue(mockDecodedToken);
  getAuth.mockReturnValue({
    verifyIdToken,
  });
};
