import { vi } from 'vitest';

export const getStorage = vi.fn().mockReturnValue({
  app: {},
  maxOperationRetryTime: 120000,
  maxUploadRetryTime: 600000,
});

export const ref = vi.fn();
export const uploadBytes = vi.fn();
export const getDownloadURL = vi.fn();
export const deleteObject = vi.fn();
