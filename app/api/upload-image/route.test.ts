import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { verifyIdToken, resetAuthAdminMocks } from '__mocks__/firebase-admin/auth';
import { mockFile, mockBucket, resetStorageAdminMocks } from '__mocks__/firebase-admin/storage';

// Mock firebase-admin modules
vi.mock('firebase-admin/auth', async () => {
  const actual = await vi.importActual('__mocks__/firebase-admin/auth');
  return actual;
});

vi.mock('firebase-admin/storage', async () => {
  const actual = await vi.importActual('__mocks__/firebase-admin/storage');
  return actual;
});

vi.mock('firebase-admin/app', async () => {
  const actual = await vi.importActual('__mocks__/firebase-admin/app');
  return actual;
});

// Mock the firebase-admin helper
vi.mock('@/lib/firebase-admin', () => ({
  getAdminApp: vi.fn(() => ({ name: '[DEFAULT]' })),
  getAdminStorage: vi.fn(() => ({
    bucket: vi.fn(() => mockBucket),
  })),
}));

// Mock sharp
vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    webp: vi.fn(() => ({
      toBuffer: vi.fn().mockResolvedValue(Buffer.from('webp-image-data')),
    })),
  })),
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-1234'),
}));

// Helper function to create a mock File
function createMockFile(
  content: string,
  filename: string,
  mimeType: string
): File {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

// Helper to create NextRequest with FormData
function createNextRequest(
  headers: Record<string, string> = {},
  file?: File
): NextRequest {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }

  const request = new NextRequest('http://localhost:3000/api/upload-image', {
    method: 'POST',
    headers,
    body: formData,
  });

  return request;
}

describe('POST /api/upload-image', () => {
  beforeEach(() => {
    resetAuthAdminMocks();
    resetStorageAdminMocks();
    vi.clearAllMocks();

    // Mock Date.now for consistent timestamps
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T12:00:00.000Z');
  });

  describe('Authentication', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const request = createNextRequest();
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('認証が必要です');
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      const request = createNextRequest({
        authorization: 'InvalidToken',
      });
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('認証が必要です');
    });

    it('should return 401 when Firebase token verification fails', async () => {
      verifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));

      const file = createMockFile('test-image-data', 'test.jpg', 'image/jpeg');
      const request = createNextRequest(
        { authorization: 'Bearer invalid-token' },
        file
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('認証トークンが無効です');
      expect(verifyIdToken).toHaveBeenCalledWith('invalid-token');
    });

    it('should accept valid Bearer token', async () => {
      const file = createMockFile('test-image-data', 'test.jpg', 'image/jpeg');
      const request = createNextRequest(
        { authorization: 'Bearer valid-token' },
        file
      );

      const response = await POST(request);

      expect(verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(response.status).toBe(200);
    });
  });

  describe('File Validation', () => {
    const validHeaders = { authorization: 'Bearer valid-token' };

    it('should return 400 when no file is provided', async () => {
      const request = createNextRequest(validHeaders);
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('ファイルが見つかりません');
    });

    it('should return 400 when file size exceeds limit', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const file = createMockFile(largeContent, 'large.jpg', 'image/jpeg');
      const request = createNextRequest(validHeaders, file);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('ファイルサイズは');
      expect(json.error).toContain('MB以下にしてください');
    });

    it('should return 400 when file type is not allowed', async () => {
      const file = createMockFile('test-data', 'test.pdf', 'application/pdf');
      const request = createNextRequest(validHeaders, file);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe(
        '許可されていない画像形式です。JPEG, PNG, GIF, WebP, SVGのみアップロード可能です。'
      );
    });

    it('should accept JPEG files', async () => {
      const file = createMockFile('test-image', 'test.jpg', 'image/jpeg');
      const request = createNextRequest(validHeaders, file);

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept PNG files', async () => {
      const file = createMockFile('test-image', 'test.png', 'image/png');
      const request = createNextRequest(validHeaders, file);

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept GIF files', async () => {
      const file = createMockFile('test-image', 'test.gif', 'image/gif');
      const request = createNextRequest(validHeaders, file);

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept WebP files', async () => {
      const file = createMockFile('test-image', 'test.webp', 'image/webp');
      const request = createNextRequest(validHeaders, file);

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept SVG files', async () => {
      const file = createMockFile('test-image', 'test.svg', 'image/svg+xml');
      const request = createNextRequest(validHeaders, file);

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should return 400 for invalid file extension', async () => {
      const file = createMockFile('test-image', 'test.txt', 'image/jpeg');
      const request = createNextRequest(validHeaders, file);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('許可されていない、または不明なファイル拡張子です。');
    });
  });

  describe('File Upload', () => {
    const validHeaders = { authorization: 'Bearer valid-token' };

    it('should upload both original and WebP versions', async () => {
      const file = createMockFile('test-image-data', 'test.jpg', 'image/jpeg');
      const request = createNextRequest(validHeaders, file);

      await POST(request);

      // Should be called twice: once for original, once for WebP
      expect(mockFile.save).toHaveBeenCalledTimes(2);
      expect(mockFile.makePublic).toHaveBeenCalledTimes(2);
    });

    it('should generate correct file paths', async () => {
      const file = createMockFile('test-image-data', 'test.jpg', 'image/jpeg');
      const request = createNextRequest(validHeaders, file);

      await POST(request);

      expect(mockBucket.file).toHaveBeenCalledWith('img/test-uuid-1234_20240101120000.jpg');
      expect(mockBucket.file).toHaveBeenCalledWith('webp/test-uuid-1234_20240101120000.webp');
    });

    it('should return success with WebP URL', async () => {
      const file = createMockFile('test-image-data', 'test.jpg', 'image/jpeg');
      const request = createNextRequest(validHeaders, file);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.url).toBe('https://storage.googleapis.com/test-bucket/test-file.webp');
      expect(json.fileName).toBe('test-uuid-1234_20240101120000');
    });

    it('should handle upload errors gracefully', async () => {
      const file = createMockFile('test-image-data', 'test.jpg', 'image/jpeg');
      const request = createNextRequest(validHeaders, file);

      const uploadError = new Error('Upload failed');
      mockFile.save.mockRejectedValueOnce(uploadError);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('画像のアップロードに失敗しました');
    });

    it('should include error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'development';

        const file = createMockFile('test-image-data', 'test.jpg', 'image/jpeg');
        const request = createNextRequest(validHeaders, file);

        const uploadError = new Error('Upload failed');
        mockFile.save.mockRejectedValueOnce(uploadError);

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.details).toBe('Upload failed');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should not include error details in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';

        const file = createMockFile('test-image-data', 'test.jpg', 'image/jpeg');
        const request = createNextRequest(validHeaders, file);

        const uploadError = new Error('Upload failed');
        mockFile.save.mockRejectedValueOnce(uploadError);

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.details).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
