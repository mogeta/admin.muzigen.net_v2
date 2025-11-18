import { vi } from 'vitest';

export const initializeApp = vi.fn().mockReturnValue({
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: false,
});

export const getApps = vi.fn().mockReturnValue([]);

export const getApp = vi.fn().mockReturnValue({
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: false,
});
