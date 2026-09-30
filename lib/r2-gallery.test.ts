import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createR2GalleryStorage, R2ConfigurationError } from './r2-gallery';

const { send, destroy } = vi.hoisted(() => ({ send: vi.fn(), destroy: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('@aws-sdk/client-s3', async (importOriginal) => ({
  ...await importOriginal<typeof import('@aws-sdk/client-s3')>(),
  S3Client: vi.fn(class { send = send; destroy = destroy; }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  send.mockReset().mockResolvedValue({});
  vi.stubEnv('R2_ACCOUNT_ID', 'a'.repeat(32));
  vi.stubEnv('R2_BUCKET_NAME', 'test-images');
  vi.stubEnv('R2_ACCESS_KEY_ID', 'test-key');
  vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-secret');
  vi.stubEnv('R2_PUBLIC_BASE_URL', 'https://images.example.com/');
});
afterEach(() => vi.unstubAllEnvs());

it('stores two cacheable WebP variants through the S3 API and returns custom-domain URLs', async () => {
  const full = Buffer.from('full');
  const thumbnail = Buffer.from('thumbnail');
  const urls = await createR2GalleryStorage().upload('unique-file', full, thumbnail);
  expect(S3Client).toHaveBeenCalledWith(expect.objectContaining({ region: 'auto', endpoint: `https://${'a'.repeat(32)}.r2.cloudflarestorage.com`, credentials: { accessKeyId: 'test-key', secretAccessKey: 'test-secret' } }));
  expect(send).toHaveBeenCalledTimes(2);
  for (const [index, key] of ['gallery/unique-file.webp', 'gallery/unique-file_thumb.webp'].entries()) {
    const command = send.mock.calls[index][0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toEqual({ Bucket: 'test-images', Key: key, Body: [full, thumbnail][index], ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable' });
  }
  expect(urls).toEqual({ url: 'https://images.example.com/gallery/unique-file.webp', thumbnailUrl: 'https://images.example.com/gallery/unique-file_thumb.webp' });
  expect(destroy).toHaveBeenCalledOnce();
});

it('cleans up both unique keys when the thumbnail write fails', async () => {
  send.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('write failed'));
  await expect(createR2GalleryStorage().upload('unique-file', Buffer.from('full'), Buffer.from('thumb'))).rejects.toThrow('write failed');
  expect(send).toHaveBeenCalledTimes(4);
  expect(send.mock.calls.slice(2).map(([command]) => {
    expect(command).toBeInstanceOf(DeleteObjectCommand);
    return command.input.Key;
  })).toEqual(['gallery/unique-file.webp', 'gallery/unique-file_thumb.webp']);
  expect(destroy).toHaveBeenCalledOnce();
});

it.each(['R2_ACCOUNT_ID', 'R2_BUCKET_NAME', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_BASE_URL'])('fails before upload when %s is missing', (name) => {
  vi.stubEnv(name, '');
  expect(() => createR2GalleryStorage()).toThrow(R2ConfigurationError);
  expect(S3Client).not.toHaveBeenCalled();
});

it.each(['http://images.example.com', 'https://pub-test.r2.dev', 'https://account.r2.cloudflarestorage.com', 'https://user:password@images.example.com', 'https://images.example.com/path', 'https://images.example.com/?token=secret', 'https://images.example.com/#fragment'])('rejects non-CDN or malformed public origins: %s', (url) => {
  vi.stubEnv('R2_PUBLIC_BASE_URL', url);
  expect(() => createR2GalleryStorage()).toThrow(R2ConfigurationError);
});
