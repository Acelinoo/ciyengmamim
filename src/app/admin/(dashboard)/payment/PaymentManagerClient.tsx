"use client";

import { useState, useTransition } from "react";
import { PaymentSettingsType } from "@/types";
import { updatePaymentSettingsAction } from "@/app/actions/admin";
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  QrCode,
  Banknote,
} from "lucide-react";
import Image from "next/image";

export function PaymentManagerClient({
  initialPayment,
}: {
  initialPayment: PaymentSettingsType;
}) {
  const [bankName, setBankName] = useState(initialPayment.bankName);
  const [accountNumber, setAccountNumber] = useState(initialPayment.accountNumber);
  const [accountHolder, setAccountHolder] = useState(initialPayment.accountHolder);
  const [bankNotes, setBankNotes] = useState(initialPayment.bankNotes || "");
  const [qrisImageUrl, setQrisImageUrl] = useState(initialPayment.qrisImageUrl || "");
  const [isBankActive, setIsBankActive] = useState(initialPayment.isBankActive);
  const [isQrisActive, setIsQrisActive] = useState(initialPayment.isQrisActive);
  const [isCodActive, setIsCodActive] = useState(initialPayment.isCodActive ?? true);
  const [codNotes, setCodNotes] = useState(
    initialPayment.codNotes || "Bayar tunai/cash langsung saat pesanan diambil atau diantar."
  );

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const payload = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      bankNotes: bankNotes.trim(),
      qrisImageUrl: qrisImageUrl.trim() || "/images/cireng-kuah.jpg",
      isBankActive,
      isQrisActive,
      isCodActive,
      codNotes: codNotes.trim(),
    };

    startTransition(async () => {
      const res = await updatePaymentSettingsAction(payload);
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Konfigurasi metode pembayaran berhasil disimpan!",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Gagal memperbarui konfigurasi pembayaran.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. Bank Transfer Config */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2DDD2] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#16253D] text-white flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-[#16253D] font-display">
                Rekening Transfer Bank
              </h2>
              <span className="text-[11px] text-[#877259]">
                BCA, Mandiri, BRI, BNI, dll
              </span>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#16253D]">
            <input
              type="checkbox"
              checked={isBankActive}
              onChange={(e) => setIsBankActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#16253D] focus:ring-[#16253D] accent-[#16253D]"
            />
            <span>{isBankActive ? "🟢 Aktif" : "🔴 Nonaktif"}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
              Nama Bank (BCA / Mandiri / BRI) *
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
              Nomor Rekening *
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
            Nama Pemilik Rekening (a.n) *
          </label>
          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
            Catatan Tambahan untuk Pembeli
          </label>
          <input
            type="text"
            value={bankNotes}
            onChange={(e) => setBankNotes(e.target.value)}
            placeholder="Mohon transfer sesuai total tagihan..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
          />
        </div>
      </div>

      {/* 2. QRIS Config */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2DDD2] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#16253D] text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-[#16253D] font-display">
                Pembayaran QRIS
              </h2>
              <span className="text-[11px] text-[#877259]">
                Scan barcode untuk semua E-Wallet & Mobile Banking
              </span>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#16253D]">
            <input
              type="checkbox"
              checked={isQrisActive}
              onChange={(e) => setIsQrisActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#16253D] focus:ring-[#16253D] accent-[#16253D]"
            />
            <span>{isQrisActive ? "🟢 Aktif" : "🔴 Nonaktif"}</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
            URL Gambar Barcode QRIS Toko
          </label>
          <input
            type="text"
            value={qrisImageUrl}
            onChange={(e) => setQrisImageUrl(e.target.value)}
            placeholder="https://.../qris.jpg atau /images/..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
          />
        </div>

        {qrisImageUrl && (
          <div className="pt-2">
            <span className="text-xs font-bold text-[#877259] block mb-2">
              Preview Barcode QRIS:
            </span>
            <div className="w-40 h-40 relative bg-[#F6F3EC] p-2 rounded-2xl border border-[#E2DDD2] overflow-hidden">
              <Image
                src={qrisImageUrl}
                alt="QRIS Preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Bayar di Tempat (COD / Tunai) Config */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2DDD2] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#16253D] text-white flex items-center justify-center">
              <Banknote className="w-4 h-4 text-[#25D366]" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-[#16253D] font-display">
                Bayar di Tempat (COD / Tunai)
              </h2>
              <span className="text-[11px] text-[#877259]">
                Pembayaran tunai langsung saat pesanan diambil atau diantar
              </span>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#16253D]">
            <input
              type="checkbox"
              checked={isCodActive}
              onChange={(e) => setIsCodActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#16253D] focus:ring-[#16253D] accent-[#16253D]"
            />
            <span>{isCodActive ? "🟢 Aktif" : "🔴 Nonaktif"}</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
            Instruksi / Catatan Bayar di Tempat untuk Pembeli
          </label>
          <input
            type="text"
            value={codNotes}
            onChange={(e) => setCodNotes(e.target.value)}
            placeholder="Bayar tunai/cash langsung saat pesanan diambil atau diantar."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3.5 bg-[#16253D] hover:bg-[#1D2D44] text-white font-black text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 border border-[#2C3E5A]"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan Pengaturan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Pembayaran</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
