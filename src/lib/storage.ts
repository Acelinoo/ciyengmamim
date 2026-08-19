import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import os from "os";

const BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || "ciyengmamim-private";
const ENDPOINT = process.env.STORAGE_ENDPOINT;
const ACCESS_KEY_ID = process.env.STORAGE_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.STORAGE_SECRET_ACCESS_KEY;
const REGION = process.env.STORAGE_REGION || "auto";

const isS3Configured = Boolean(
  ENDPOINT &&
    ACCESS_KEY_ID &&
    SECRET_ACCESS_KEY &&
    !ENDPOINT.includes("mock-storage")
);

const s3Client = isS3Configured
  ? new S3Client({
      region: REGION,
      endpoint: ENDPOINT,
      credentials: {
        accessKeyId: ACCESS_KEY_ID!,
        secretAccessKey: SECRET_ACCESS_KEY!,
      },
    })
  : null;

// Global in-memory cache to ensure serverless (Vercel) & local development NEVER fail
const globalProofMemory = globalThis as unknown as {
  inMemoryProofStore?: Map<string, { buffer: Buffer; mimeType: string; createdAt: number }>;
};

if (!globalProofMemory.inMemoryProofStore) {
  globalProofMemory.inMemoryProofStore = new Map();
}

const memoryStore = globalProofMemory.inMemoryProofStore;

// Local fallback storage directory
const LOCAL_STORAGE_DIR = path.join(process.cwd(), "public", "uploads", "private");
const TMP_STORAGE_DIR = path.join(os.tmpdir(), "ciyengmamim_proofs");

function ensureLocalDir(baseDir: string, subfolder: string) {
  const dir = path.join(baseDir, subfolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Menyimpan buffer file ke Private Storage (S3/R2, Local Storage, dan Memory Fallback)
 */
export async function uploadPrivateFile(
  buffer: Buffer,
  folder: string,
  filename: string,
  contentType: string
): Promise<{ filePath: string }> {
  const filePath = `${folder}/${filename}`;

  // 1. Always cache in memory (Ensures Vercel serverless functions can retrieve it instantly)
  memoryStore.set(filePath, {
    buffer,
    mimeType: contentType,
    createdAt: Date.now(),
  });

  // Keep memory clean (delete items older than 2 hours)
  if (memoryStore.size > 200) {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    for (const [key, value] of memoryStore.entries()) {
      if (value.createdAt < twoHoursAgo) memoryStore.delete(key);
    }
  }

  // 2. Upload to S3 if configured
  if (s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: buffer,
        ContentType: contentType,
      });
      await s3Client.send(command);
      return { filePath };
    } catch (err) {
      console.warn("S3 upload failed, falling back to local/memory:", err);
    }
  }

  // 3. Try writing to local or tmp directory
  try {
    const targetDir = ensureLocalDir(LOCAL_STORAGE_DIR, folder);
    const targetPath = path.join(targetDir, filename);
    await fs.promises.writeFile(targetPath, buffer);
  } catch {
    try {
      const targetDir = ensureLocalDir(TMP_STORAGE_DIR, folder);
      const targetPath = path.join(targetDir, filename);
      await fs.promises.writeFile(targetPath, buffer);
    } catch {
      // Memory store is already populated
    }
  }

  return { filePath };
}

/**
 * Mengambil Buffer file dari Memory, Local Disk, atau S3
 */
export async function getPrivateFileBuffer(
  filePath: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  // 1. Check memory store
  const cached = memoryStore.get(filePath);
  if (cached) {
    return { buffer: cached.buffer, mimeType: cached.mimeType };
  }

  // 2. Check local disk
  const localPath = path.join(LOCAL_STORAGE_DIR, filePath);
  if (fs.existsSync(localPath)) {
    const buffer = await fs.promises.readFile(localPath);
    return { buffer, mimeType: "image/webp" };
  }

  // 3. Check tmp directory
  const tmpPath = path.join(TMP_STORAGE_DIR, filePath);
  if (fs.existsSync(tmpPath)) {
    const buffer = await fs.promises.readFile(tmpPath);
    return { buffer, mimeType: "image/webp" };
  }

  // 4. Check S3 if available
  if (s3Client) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
      });
      const response = await s3Client.send(command);
      const byteArray = await response.Body?.transformToByteArray();
      if (byteArray) {
        return {
          buffer: Buffer.from(byteArray),
          mimeType: response.ContentType || "image/webp",
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Menghasilkan Expiring Signed URL atau stream endpoint
 */
export async function getExpiringSignedUrl(
  filePath: string,
  expiresInSeconds: number = 259200
): Promise<string> {
  if (s3Client) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
      });
      return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    } catch {
      // Fallback below
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}/api/proof/file?path=${encodeURIComponent(filePath)}`;
}

/**
 * Menghapus file dari Storage
 */
export async function deletePrivateFile(filePath: string): Promise<void> {
  memoryStore.delete(filePath);

  if (s3Client) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
      });
      await s3Client.send(command);
    } catch {
      // ignore
    }
  }

  const fullPath = path.join(LOCAL_STORAGE_DIR, filePath);
  if (fs.existsSync(fullPath)) {
    try {
      await fs.promises.unlink(fullPath);
    } catch {
      // ignore
    }
  }
}
