import { vi } from 'vitest';

export const mockApp = {
  name: '[DEFAULT]',
  options: {},
};

export const initializeApp = vi.fn().mockReturnValue(mockApp);
export const cert = vi.fn();
export const getApps = vi.fn().mockReturnValue([]);
export const getApp = vi.fn().mockReturnValue(mockApp);
