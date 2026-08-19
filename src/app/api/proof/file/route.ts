import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const filePath = searchParams.get("path");

  if (!filePath || filePath.includes("..")) {
    return NextResponse.json({ error: "Akses tidak valid" }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), "public", "uploads", "private", filePath);

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }

  try {
    const fileBuffer = await fs.promises.readFile(fullPath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal membaca file" }, { status: 500 });
  }
}
