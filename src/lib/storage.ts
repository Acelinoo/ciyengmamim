import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

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

// Local storage directory for development fallback
const LOCAL_STORAGE_DIR = path.join(process.cwd(), "public", "uploads", "private");

function ensureLocalDir(subfolder: string) {
  const dir = path.join(LOCAL_STORAGE_DIR, subfolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Menyimpan buffer file ke Private Storage (S3/R2 atau Local Secure fallback)
 */
export async function uploadPrivateFile(
  buffer: Buffer,
  folder: string,
  filename: string,
  contentType: string
): Promise<{ filePath: string }> {
  const filePath = `${folder}/${filename}`;

  if (s3Client) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: contentType,
    });
    await s3Client.send(command);
    return { filePath };
  } else {
    // Local development fallback
    const targetDir = ensureLocalDir(folder);
    const targetPath = path.join(targetDir, filename);
    await fs.promises.writeFile(targetPath, buffer);
    return { filePath };
  }
}

/**
 * Menghasilkan Expiring Signed URL (TTL 72 Jam = 259200 detik) untuk akses privat
 */
export async function getExpiringSignedUrl(
  filePath: string,
  expiresInSeconds: number = 259200
): Promise<string> {
  if (s3Client) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  } else {
    // Local development fallback: Return direct stream endpoint
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${appUrl}/api/proof/file?path=${encodeURIComponent(filePath)}`;
  }
}

/**
 * Menghapus file dari Storage
 */
export async function deletePrivateFile(filePath: string): Promise<void> {
  if (s3Client) {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });
    await s3Client.send(command);
  } else {
    const fullPath = path.join(LOCAL_STORAGE_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}
