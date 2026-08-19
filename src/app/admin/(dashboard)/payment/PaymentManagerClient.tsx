"use client";

import { useState, useTransition } from "react";
import { PaymentSettingsType } from "@/types";
import { updatePaymentSettingsAction } from "@/app/actions/admin";
import { Save, Loader2, AlertCircle, CheckCircle2, CreditCard, QrCode } from "lucide-react";
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
      qrisImageUrl: qrisImageUrl.trim() || null,
      isBankActive,
      isQrisActive,
    };

    startTransition(async () => {
      const res = await updatePaymentSettingsAction(payload);
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Konfigurasi pembayaran berhasil disimpan!",
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
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-[#EBF7EE] text-[#1E562A] border border-[#D4EED8]"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. Bank Transfer Config */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEBE0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE0]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#E23E28]" />
            <h2 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
              Rekening Transfer Bank
            </h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#525048]">
            <input
              type="checkbox"
              checked={isBankActive}
              onChange={(e) => setIsBankActive(e.target.checked)}
              className="rounded text-[#E23E28] focus:ring-[#E23E28]"
            />
            <span>Aktifkan Opsi Bank</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#525048] mb-1">
              Nama Bank (BCA / Mandiri / BRI) *
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#525048] mb-1">
              Nomor Rekening *
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#525048] mb-1">
            Nama Pemilik Rekening *
          </label>
          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#525048] mb-1">
            Catatan Tambahan untuk Customer
          </label>
          <input
            type="text"
            value={bankNotes}
            onChange={(e) => setBankNotes(e.target.value)}
            placeholder="Mohon transfer sesuai total tagihan..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
          />
        </div>
      </div>

      {/* 2. QRIS Config */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEBE0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE0]">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#E23E28]" />
            <h2 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
              Pembayaran QRIS
            </h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#525048]">
            <input
              type="checkbox"
              checked={isQrisActive}
              onChange={(e) => setIsQrisActive(e.target.checked)}
              className="rounded text-[#E23E28] focus:ring-[#E23E28]"
            />
            <span>Aktifkan Opsi QRIS</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#525048] mb-1">
            URL Gambar Barcode QRIS Toko
          </label>
          <input
            type="text"
            value={qrisImageUrl}
            onChange={(e) => setQrisImageUrl(e.target.value)}
            placeholder="https://.../qris.jpg"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
          />
        </div>

        {qrisImageUrl && (
          <div className="pt-2">
            <span className="text-xs font-bold text-[#8A8679] block mb-2">
              Preview Barcode QRIS:
            </span>
            <div className="w-36 h-36 relative bg-[#FAF7EE] p-2 rounded-2xl border border-[#EFEBE0] overflow-hidden">
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3.5 bg-[#1E1D1A] hover:bg-[#33312B] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
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
