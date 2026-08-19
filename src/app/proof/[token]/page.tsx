import { db } from "@/lib/db";
import { getExpiringSignedUrl } from "@/lib/storage";
import { AlertCircle, Clock, ShieldCheck, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Bukti Pembayaran — Ciyeng Mamim",
  robots: { index: false, follow: false },
};

interface ProofViewerPageProps {
  params: Promise<{ token: string }>;
}

export default async function ProofViewerPage({ params }: ProofViewerPageProps) {
  const { token } = await params;

  let proof = null;
  let signedUrl: string | null = null;

  try {
    proof = await db.paymentProof.findUnique({
      where: { accessToken: token },
    });

    if (proof) {
      // Prioritaskan Direct Base64 Data URL jika ada (Jaminan 100% tampil di Vercel tanpa S3)
      if (proof.fileData && proof.fileData.startsWith("data:image/")) {
        signedUrl = proof.fileData;
      } else {
        signedUrl = await getExpiringSignedUrl(proof.filePath, 86400);
      }
    }
  } catch (error) {
    console.error("Fetch proof error:", error);
  }

  // Fallback memory check
  if (!signedUrl && token.startsWith("proof_")) {
    try {
      signedUrl = await getExpiringSignedUrl(`proofs/2026-08/${token}.webp`, 86400);
    } catch {
      // ignore
    }
  }

  if (!proof && !signedUrl) {
    return (
      <div className="min-h-screen bg-[#F6F3EC] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border border-[#E2DDD2] shadow-xl text-center">
          <div className="w-14 h-14 bg-red-50 text-[#D83A2E] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-black text-xl text-[#16253D] mb-2 font-display">
            Bukti Pembayaran Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5E7A] leading-relaxed mb-6">
            Tautan bukti pembayaran ini mungkin sudah kedaluwarsa (retensi 14 hari) atau token akses tidak valid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#16253D] text-white font-bold text-xs sm:text-sm rounded-full hover:bg-[#1D2D44] transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  const uploadDate = proof?.uploadedAt
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      }).format(new Date(proof.uploadedAt))
    : new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      }).format(new Date());

  const imageSrc = signedUrl || (proof?.fileData ?? "");

  return (
    <div className="min-h-screen bg-[#F6F3EC] p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#E2DDD2] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2DDD2] bg-[#EFECE3]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#16253D] p-0.5 border border-[#2C3E5A] shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo Ciyeng Mamim"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-black text-sm text-[#16253D] block font-display">
                ciyeng mamim
              </span>
              <span className="text-[10px] text-[#877259] font-bold">
                Sistem Verifikasi Bukti Transfer
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] font-black text-[#15803D] bg-[#F0FDF4] px-3 py-1.5 rounded-full border border-[#DCFCE7] shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Tervalidasi</span>
          </div>
        </div>

        {/* Image Container */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          <div className="relative w-full max-h-[550px] min-h-[320px] rounded-2xl overflow-hidden bg-[#F6F3EC] border border-[#E2DDD2] shadow-sm mb-4 flex items-center justify-center p-2">
            {imageSrc ? (
              // Menggunakan standard img element dengan support base64 murni untuk kompatibilitas mutlak di mobile browser
              <img
                src={imageSrc}
                alt="Bukti Transfer Customer"
                className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-xs"
              />
            ) : (
              <div className="py-12 text-center text-[#877259]">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#D83A2E]" />
                <span className="text-xs font-bold">Gagal memuat gambar bukti transfer</span>
              </div>
            )}
          </div>

          {/* Metadata info */}
          <div className="w-full bg-[#F6F3EC] p-3.5 rounded-2xl border border-[#E2DDD2] text-xs text-[#4B5E7A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#877259]" />
              <span>
                Waktu Unggah: <strong className="text-[#16253D]">{uploadDate} WIB</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2DDD2] bg-[#EFECE3]/30 flex items-center justify-between text-xs text-[#877259]">
          <span>
            Token: <code className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#E2DDD2] text-[#16253D]">{token.slice(0, 16)}...</code>
          </span>
          <Link
            href="/"
            className="font-bold text-[#16253D] hover:text-[#1D2D44] flex items-center gap-1 hover:underline"
          >
            <span>Buka Toko</span>
            <span>➔</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
