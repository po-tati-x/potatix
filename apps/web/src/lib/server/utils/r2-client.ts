import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '@/env.server';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_KEY,
  },
});

const BUCKET_NAME = env.CLOUDFLARE_R2_BUCKET_NAME;
const PUBLIC_URL = env.CLOUDFLARE_R2_PUBLIC_URL;

export async function uploadFile(file: Buffer, key: string, contentType: string): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return `${PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error(`Failed to upload file to R2: ${error}`);
    throw new Error('Storage upload failed');
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error(`Failed to delete file from R2: ${error}`);
    throw new Error('Storage deletion failed');
  }
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export function extractKeyFromUrl(url: string): string {
  if (!url) return '';
  
  // Get the key after the public URL
  if (url.startsWith(PUBLIC_URL)) {
    return url.substring(PUBLIC_URL.length + 1);
  }
  
  // If it's already a key, return it directly
  return url;
} 