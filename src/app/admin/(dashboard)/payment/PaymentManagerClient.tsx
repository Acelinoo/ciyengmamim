"use client";

import { useState, useTransition, useRef } from "react";
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
  Upload,
  Trash2,
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
  const [qrisNmid, setQrisNmid] = useState(initialPayment.qrisNmid || "");
  const [isBankActive, setIsBankActive] = useState(initialPayment.isBankActive);
  const [isQrisActive, setIsQrisActive] = useState(initialPayment.isQrisActive);
  const [isCodActive, setIsCodActive] = useState(initialPayment.isCodActive ?? true);
  const [codNotes, setCodNotes] = useState(
    initialPayment.codNotes || "Bayar tunai/cash langsung saat pesanan diambil atau diantar."
  );

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/qris-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      const uploadedUrl = data.url;
      setQrisImageUrl(uploadedUrl);

      // Auto-save update to Database & Server State immediately
      const payload = {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        bankNotes: bankNotes.trim(),
        qrisImageUrl: uploadedUrl,
        qrisNmid: qrisNmid.trim(),
        isBankActive,
        isQrisActive,
        isCodActive,
        codNotes: codNotes.trim(),
      };

      startTransition(async () => {
        const updateRes = await updatePaymentSettingsAction(payload);
        if (updateRes.success) {
          setFeedback({
            type: "success",
            text: "Foto barcode QRIS berhasil diunggah & langsung aktif tersimpan ke sistem!",
          });
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah barcode QRIS.";
      setUploadError(msg);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const payload = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      bankNotes: bankNotes.trim(),
      qrisImageUrl: qrisImageUrl.trim() || "/images/cireng-kuah.jpg",
      qrisNmid: qrisNmid.trim(),
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
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2DDD2] shadow-sm space-y-5">
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

        {/* Upload QRIS dari Galeri HP / PC */}
        <div className="bg-[#F6F3EC] p-4 sm:p-5 rounded-2xl border border-[#E2DDD2] space-y-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-[#16253D]">
                Foto / Barcode QRIS Toko
              </label>
              <span className="text-[11px] text-[#877259]">
                Unggah barcode QRIS langsung dari galeri foto HP atau komputer Anda
              </span>
            </div>

            {qrisImageUrl && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF7EE] text-[#15803D] text-[11px] font-bold border border-[#C6EDCE]">
                <CheckCircle2 className="w-3 h-3" />
                Foto QRIS Terpasang
              </span>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleImageFileSelect}
            className="sr-only"
          />

          {/* Upload & Preview Box */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1">
            {/* Preview Card */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl bg-white border-2 border-dashed border-[#CFC8B8] flex flex-col items-center justify-center p-2.5 overflow-hidden shadow-2xs group shrink-0">
              {qrisImageUrl ? (
                <>
                  <Image
                    src={qrisImageUrl}
                    alt="Preview QRIS"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="p-2 bg-white text-[#16253D] rounded-full shadow hover:bg-[#F6F3EC] transition-colors"
                      title="Ganti Foto QRIS"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrisImageUrl("")}
                      className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-red-50 transition-colors"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center text-[#877259] p-2">
                  <QrCode className="w-10 h-10 mb-1 opacity-50 text-[#16253D]" />
                  <span className="text-[11px] font-bold text-[#4B5E7A]">Belum Ada QRIS</span>
                  <span className="text-[9px] text-[#877259]">Pilih foto untuk pasang</span>
                </div>
              )}
            </div>

            {/* Action buttons & Details */}
            <div className="flex-1 space-y-2.5 w-full text-center sm:text-left">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="px-4 py-2.5 bg-[#16253D] hover:bg-[#1D2D44] text-white rounded-xl text-xs font-black flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengunggah Foto QRIS...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{qrisImageUrl ? "Ganti Foto dari Galeri" : "Pilih Foto dari Galeri HP / PC"}</span>
                    </>
                  )}
                </button>

                {qrisImageUrl && (
                  <button
                    type="button"
                    onClick={() => setQrisImageUrl("")}
                    disabled={isUploadingImage}
                    className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#877259] leading-relaxed">
                Mendukung format <strong>JPG, PNG, WEBP</strong>. Barcode akan otomatis dioptimalkan dan dikompresi agar kualitas tetap tajam saat di-scan oleh pembeli.
              </p>

              {uploadError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Opsi link manual (collapsible) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualUrl(!showManualUrl)}
                  className="text-[11px] text-[#4B5E7A] hover:text-[#16253D] font-bold underline flex items-center gap-1 mx-auto sm:mx-0"
                >
                  <span>{showManualUrl ? "Sembunyikan Opsi URL Manual" : "Atau gunakan link URL gambar manual"}</span>
                </button>

                {showManualUrl && (
                  <div className="mt-2 space-y-1">
                    <input
                      type="text"
                      value={qrisImageUrl}
                      onChange={(e) => setQrisImageUrl(e.target.value)}
                      placeholder="https://.../qris.jpg atau /images/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#CFC8B8] text-xs bg-white text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
                    />
                    <span className="text-[10px] text-[#877259] block">
                      Masukkan link gambar eksternal jika sudah dihosting di server lain.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NMID Input */}
        <div>
          <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
            NMID / Merchant ID QRIS (Opsional)
          </label>
          <input
            type="text"
            value={qrisNmid}
            onChange={(e) => setQrisNmid(e.target.value)}
            placeholder="Contoh: ID1020030040050"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
          />
          <span className="text-[10px] text-[#877259] mt-1 block">
            Nomor NMID resmi toko Anda (opsional, akan ditampilkan di bawah barcode pada jendela checkout).
          </span>
        </div>
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
