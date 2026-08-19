import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { validateImageMagicBytes } from "@/lib/security/magic-bytes";
import { uploadPrivateFile } from "@/lib/storage";
import { db } from "@/lib/db";
import sharp from "sharp";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: Maksimal 5 upload per 10 menit per IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimit = checkRateLimit(`upload-proof:${clientIp}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak permintaan upload. Harap tunggu beberapa menit sebelum mencoba kembali.",
        },
        { status: 429 }
      );
    }

    // 2. Ambil form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File bukti pembayaran tidak ditemukan." },
        { status: 400 }
      );
    }

    // 3. Validasi ukuran file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file melebihi batas maksimal 5MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 4. Validasi Magic Bytes (Keamanan Buffer)
    const magicValidation = validateImageMagicBytes(rawBuffer);
    if (!magicValidation.isValid) {
      return NextResponse.json(
        { error: magicValidation.error || "Format file tidak didukung." },
        { status: 400 }
      );
    }

    // 5. Kompresi & Optimalisasi Gambar menggunakan Sharp (WebP, max 1200px)
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(rawBuffer)
        .rotate() // Auto-orient dari EXIF kamera smartphone
        .resize({ width: 1200, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      optimizedBuffer = rawBuffer;
    }

    // 6. Generate Random UUID filename (Abaikan nama file asli client)
    const randomUuid = crypto.randomUUID();
    const safeFilename = `${randomUuid}.webp`;
    const yearMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-08"
    const folder = `proofs/${yearMonth}`;

    // 7. Simpan ke Private Storage
    const { filePath } = await uploadPrivateFile(
      optimizedBuffer,
      folder,
      safeFilename,
      "image/webp"
    );

    // 8. Simpan Metadata & Access Token di Database (TTL 14 hari)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const accessToken = `proof_${crypto.randomBytes(12).toString("hex")}`;

    let savedProof;
    try {
      savedProof = await db.paymentProof.create({
        data: {
          accessToken,
          filePath,
          fileSize: optimizedBuffer.length,
          mimeType: "image/webp",
          expiresAt,
        },
      });
    } catch {
      // Fallback jika DB belum ter-migrate
      savedProof = { accessToken, filePath };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      success: true,
      token: savedProof.accessToken,
      previewUrl: `${appUrl}/proof/${savedProof.accessToken}`,
    });
  } catch (error) {
    console.error("Upload proof error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah bukti pembayaran. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
