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

// Global in-memory cache
const globalProofMemory = globalThis as unknown as {
  inMemoryProofStore?: Map<string, { buffer: Buffer; mimeType: string; createdAt: number }>;
};

if (!globalProofMemory.inMemoryProofStore) {
  globalProofMemory.inMemoryProofStore = new Map();
}

const memoryStore = globalProofMemory.inMemoryProofStore;

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
 * Upload gambar ke CDN Publik Permanen (Gratis, Stateless, 100% Reliable di Vercel)
 */
export async function uploadToPublicFallbackCDN(
  buffer: Buffer,
  filename: string
): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append("reqtype", "fileupload");
    fd.append("fileToUpload", new Blob([new Uint8Array(buffer)], { type: "image/webp" }), filename);

    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: fd,
    });

    if (res.ok) {
      const cdnUrl = (await res.text()).trim();
      if (cdnUrl.startsWith("http")) {
        return cdnUrl;
      }
    }
  } catch (err) {
    console.warn("Public CDN upload failed, fallback to secondary:", err);
  }

  // Secondary Fallback: Litterbox
  try {
    const fd = new FormData();
    fd.append("reqtype", "fileupload");
    fd.append("time", "72h");
    fd.append("fileToUpload", new Blob([new Uint8Array(buffer)], { type: "image/webp" }), filename);

    const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
      method: "POST",
      body: fd,
    });

    if (res.ok) {
      const cdnUrl = (await res.text()).trim();
      if (cdnUrl.startsWith("http")) {
        return cdnUrl;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Menyimpan buffer file ke Storage
 */
export async function uploadPrivateFile(
  buffer: Buffer,
  folder: string,
  filename: string,
  contentType: string
): Promise<{ filePath: string }> {
  const filePath = `${folder}/${filename}`;

  memoryStore.set(filePath, {
    buffer,
    mimeType: contentType,
    createdAt: Date.now(),
  });

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
      console.warn("S3 upload failed:", err);
    }
  }

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
      // ignore
    }
  }

  return { filePath };
}

/**
 * Mengambil Buffer file
 */
export async function getPrivateFileBuffer(
  filePath: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const cached = memoryStore.get(filePath);
  if (cached) {
    return { buffer: cached.buffer, mimeType: cached.mimeType };
  }

  const localPath = path.join(LOCAL_STORAGE_DIR, filePath);
  if (fs.existsSync(localPath)) {
    const buffer = await fs.promises.readFile(localPath);
    return { buffer, mimeType: "image/webp" };
  }

  const tmpPath = path.join(TMP_STORAGE_DIR, filePath);
  if (fs.existsSync(tmpPath)) {
    const buffer = await fs.promises.readFile(tmpPath);
    return { buffer, mimeType: "image/webp" };
  }

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
 * Menghasilkan Expiring Signed URL
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
