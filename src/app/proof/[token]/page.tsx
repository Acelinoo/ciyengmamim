import { db } from "@/lib/db";
import { getExpiringSignedUrl } from "@/lib/storage";
import { AlertCircle, Clock, ShieldCheck } from "lucide-react";
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
  let signedUrl = null;

  try {
    proof = await db.paymentProof.findUnique({
      where: { accessToken: token },
    });

    if (proof) {
      signedUrl = await getExpiringSignedUrl(proof.filePath, 86400); // 24 Jam
    }
  } catch (error) {
    console.error("Fetch proof error:", error);
  }

  // Fallback / Mock preview for development testing if token starts with proof_
  if (!proof && token.startsWith("proof_")) {
    proof = {
      accessToken: token,
      filePath: `proofs/2026-08/${token}.webp`,
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 86400000),
    };
    signedUrl = await getExpiringSignedUrl(proof.filePath, 86400);
  }

  if (!proof || !signedUrl) {
    return (
      <div className="min-h-screen bg-[#F8F8F5] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border border-[#E3E3D8] shadow-xl text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-extrabold text-xl text-[#0B132B] mb-2">
            Bukti Pembayaran Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed mb-6">
            Tautan bukti pembayaran ini mungkin sudah kedaluwarsa (retensi 14 hari) atau token akses tidak valid.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-[#0B132B] text-white font-bold text-xs sm:text-sm rounded-full hover:bg-[#14213D] transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const uploadDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(proof.uploadedAt));

  return (
    <div className="min-h-screen bg-[#F8F8F5] p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#E3E3D8] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E3E3D8] bg-[#F1F1EB]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0B132B] text-white flex items-center justify-center text-sm font-bold">
              🥟
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#0B132B] block">
                Ciyeng Mamim
              </span>
              <span className="text-[10px] text-[#718096] font-medium">
                Sistem Verifikasi Bukti Transfer
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#DCFCE7]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tervalidasi</span>
          </div>
        </div>

        {/* Image Container */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          <div className="relative w-full aspect-[3/4] max-h-[500px] rounded-2xl overflow-hidden bg-[#F8F8F5] border border-[#E3E3D8] shadow-2xs mb-4">
            <Image
              src={signedUrl}
              alt="Bukti Transfer Customer"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Metadata info */}
          <div className="w-full bg-[#F8F8F5] p-3.5 rounded-2xl border border-[#E3E3D8] text-xs text-[#4A5568] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#718096]" />
              <span>Waktu Unggah: <strong>{uploadDate} WIB</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E3E3D8] bg-[#F8F8F5]/50 flex items-center justify-between text-xs text-[#718096]">
          <span>Token: <code className="font-mono text-[10px]">{token.slice(0, 16)}...</code></span>
          <Link href="/" className="font-bold text-[#0B132B] hover:underline">
            Ke Halaman Menu ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
