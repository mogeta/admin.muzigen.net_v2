import { vi } from 'vitest';

export const getFirestore = vi.fn().mockReturnValue({
  type: 'firestore',
  app: {},
});

export const collection = vi.fn();
export const doc = vi.fn();
export const getDoc = vi.fn();
export const getDocs = vi.fn();
export const addDoc = vi.fn();
export const updateDoc = vi.fn();
export const deleteDoc = vi.fn();
export const query = vi.fn();
export const where = vi.fn();
export const orderBy = vi.fn();
export const limit = vi.fn();
export const startAfter = vi.fn();
export const Timestamp = {
  now: vi.fn().mockReturnValue({ seconds: Date.now() / 1000, nanoseconds: 0 }),
  fromDate: vi.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
};
