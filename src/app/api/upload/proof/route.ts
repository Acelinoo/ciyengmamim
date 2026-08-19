import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { validateImageMagicBytes } from "@/lib/security/magic-bytes";
import { uploadPrivateFile } from "@/lib/storage";
import { db } from "@/lib/db";
import sharp from "sharp";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimit = checkRateLimit(`upload-proof:${clientIp}`, {
      limit: 50,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak permintaan upload. Harap tunggu beberapa saat sebelum mencoba kembali.",
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
        { error: "Ukuran file melebihi batas maksimal 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 4. Validasi Magic Bytes
    const magicValidation = validateImageMagicBytes(rawBuffer);
    if (!magicValidation.isValid) {
      return NextResponse.json(
        { error: magicValidation.error || "Format file tidak didukung (gunakan JPG, PNG, WEBP)." },
        { status: 400 }
      );
    }

    // 5. Kompresi & Optimalisasi Gambar menggunakan Sharp (WebP, max width 1000px, quality 75)
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(rawBuffer)
        .rotate() // Auto-orient dari EXIF smartphone
        .resize({ width: 1000, height: 1400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();
    } catch {
      optimizedBuffer = rawBuffer;
    }

    // 6. Generate Base64 Data URL (Jaminan 100% foto tampil di semua serverless Vercel)
    const base64Data = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;

    // 7. Generate Random UUID filename
    const randomUuid = crypto.randomUUID();
    const safeFilename = `${randomUuid}.webp`;
    const yearMonth = new Date().toISOString().slice(0, 7);
    const folder = `proofs/${yearMonth}`;

    // 8. Simpan ke Storage Buffer
    const { filePath } = await uploadPrivateFile(
      optimizedBuffer,
      folder,
      safeFilename,
      "image/webp"
    );

    // 9. Simpan Metadata & Access Token di Database (TTL 14 hari)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const accessToken = `proof_${crypto.randomBytes(12).toString("hex")}`;

    try {
      await db.paymentProof.create({
        data: {
          accessToken,
          filePath,
          fileSize: optimizedBuffer.length,
          mimeType: "image/webp",
          fileData: base64Data,
          expiresAt,
        },
      });
    } catch (dbErr) {
      console.warn("DB save proof warning:", dbErr);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      success: true,
      token: accessToken,
      filePath,
      previewUrl: `${appUrl.replace(/\/$/, "")}/proof/${accessToken}`,
    });
  } catch (error) {
    console.error("Upload proof error:", error);
    const msg = error instanceof Error ? error.message : "Gagal mengunggah bukti pembayaran.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
