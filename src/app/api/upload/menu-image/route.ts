import { NextRequest, NextResponse } from "next/server";
import { validateImageMagicBytes } from "@/lib/security/magic-bytes";
import { uploadToPublicFallbackCDN, uploadPrivateFile } from "@/lib/storage";
import sharp from "sharp";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Validasi format file
    const magicValidation = validateImageMagicBytes(rawBuffer);
    if (!magicValidation.isValid) {
      return NextResponse.json(
        { error: magicValidation.error || "Format file tidak didukung (gunakan JPG, PNG, WEBP, HEIC)." },
        { status: 400 }
      );
    }

    // Kompresi WebP
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      optimizedBuffer = rawBuffer;
    }

    const randomUuid = crypto.randomUUID();
    const safeFilename = `menu-${randomUuid}.webp`;

    // Coba upload ke CDN Publik (Permanent) & Local Storage
    const [localRes, cdnUrl] = await Promise.all([
      uploadPrivateFile(optimizedBuffer, "menu", safeFilename, "image/webp"),
      uploadToPublicFallbackCDN(optimizedBuffer, safeFilename),
    ]);

    const finalUrl = cdnUrl || `/api/proof/file?path=${encodeURIComponent(localRes.filePath)}`;

    return NextResponse.json({
      success: true,
      url: finalUrl,
    });
  } catch (error) {
    console.error("Upload menu image error:", error);
    const msg = error instanceof Error ? error.message : "Gagal mengunggah gambar menu.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
