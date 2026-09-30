import 'server-only';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class R2ConfigurationError extends Error {}

// Read at request time so builds do not require production upload credentials.
export function createR2GalleryStorage() {
  const required = (name: string) => {
    const value = process.env[name]?.trim();
    if (!value) throw new R2ConfigurationError(`${name} is required`);
    return value;
  };
  const accountId = required('R2_ACCOUNT_ID');
  const bucket = required('R2_BUCKET_NAME');
  const accessKeyId = required('R2_ACCESS_KEY_ID');
  const secretAccessKey = required('R2_SECRET_ACCESS_KEY');
  const publicBase = required('R2_PUBLIC_BASE_URL');
  if (!/^[a-f0-9]{32}$/i.test(accountId)) throw new R2ConfigurationError('Invalid R2_ACCOUNT_ID');
  let publicUrl: URL;
  try { publicUrl = new URL(publicBase); } catch { throw new R2ConfigurationError('Invalid R2_PUBLIC_BASE_URL'); }
  if (publicUrl.protocol !== 'https:' || publicUrl.username || publicUrl.password || publicUrl.search || publicUrl.hash || publicUrl.pathname !== '/' || publicUrl.hostname.endsWith('.r2.dev') || publicUrl.hostname.endsWith('.cloudflarestorage.com')) {
    throw new R2ConfigurationError('R2_PUBLIC_BASE_URL must be an HTTPS custom domain origin');
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    maxAttempts: 3,
  });
  return {
    async upload(baseFileName: string, full: Buffer, thumbnail: Buffer) {
      const keys = [`gallery/${baseFileName}.webp`, `gallery/${baseFileName}_thumb.webp`];
      const bodies = [full, thumbnail];
      try {
        for (const [index, key] of keys.entries()) {
          await client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: bodies[index],
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
          }));
        }
        return { url: `${publicUrl.origin}/${keys[0]}`, thumbnailUrl: `${publicUrl.origin}/${keys[1]}` };
      } catch (error) {
        // Unique keys belong only to this attempt. Remove either variant even
        // when a write succeeded remotely but its acknowledgement was lost.
        const cleanup = await Promise.allSettled(keys.map((Key) => client.send(new DeleteObjectCommand({ Bucket: bucket, Key }))));
        if (cleanup.some((result) => result.status === 'rejected')) console.error('R2 gallery cleanup failed; orphaned objects may remain');
        throw error;
      } finally {
        client.destroy();
      }
    },
  };
}
