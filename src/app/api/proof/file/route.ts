import { NextRequest, NextResponse } from "next/server";
import { getPrivateFileBuffer } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const filePath = searchParams.get("path");

  if (!filePath || filePath.includes("..")) {
    return NextResponse.json({ error: "Akses tidak valid" }, { status: 400 });
  }

  try {
    const fileData = await getPrivateFileBuffer(filePath);

    if (!fileData) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(fileData.buffer), {
      headers: {
        "Content-Type": fileData.mimeType || "image/webp",
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Error serving proof file:", err);
    return NextResponse.json({ error: "Gagal membaca file" }, { status: 500 });
  }
}
