import { vi } from 'vitest';

export const mockPublicUrl = 'https://storage.googleapis.com/test-bucket/test-file.webp';

const mockFile = {
  save: vi.fn().mockResolvedValue(undefined),
  makePublic: vi.fn().mockResolvedValue(undefined),
  publicUrl: vi.fn().mockReturnValue(mockPublicUrl),
};

const mockBucket = {
  file: vi.fn().mockReturnValue(mockFile),
};

export const getStorage = vi.fn().mockReturnValue({
  bucket: vi.fn().mockReturnValue(mockBucket),
});

export const resetStorageAdminMocks = () => {
  mockFile.save.mockClear();
  mockFile.makePublic.mockClear();
  mockFile.publicUrl.mockClear();
  mockBucket.file.mockClear();

  mockFile.save.mockResolvedValue(undefined);
  mockFile.makePublic.mockResolvedValue(undefined);
  mockFile.publicUrl.mockReturnValue(mockPublicUrl);
  mockBucket.file.mockReturnValue(mockFile);
};

export { mockFile, mockBucket };
