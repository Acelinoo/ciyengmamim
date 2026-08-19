"use client";

import { useState, useTransition } from "react";
import { CartItem, PaymentSettingsType } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import { processCheckoutAction } from "@/app/actions/checkout";
import {
  X,
  Upload,
  Copy,
  Check,
  QrCode,
  CreditCard,
  MessageCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  paymentSettings: PaymentSettingsType;
  onSuccessOrder: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  paymentSettings,
  onSuccessOrder,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "QRIS">(
    paymentSettings.isBankActive ? "BANK_TRANSFER" : "QRIS"
  );

  const [isUploading, setIsUploading] = useState(false);
  const [proofToken, setProofToken] = useState<string | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [directWhatsappUrl, setDirectWhatsappUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(paymentSettings.accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const localUrl = URL.createObjectURL(file);
    setProofPreviewUrl(localUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/proof", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah bukti pembayaran.");
      }

      setProofToken(data.token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah file.";
      setUploadError(msg);
      setProofToken(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitCheckout = () => {
    setErrorMessage(null);
    setDirectWhatsappUrl(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage("Harap masukkan nama lengkap pemesan (minimal 2 karakter).");
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage("Harap masukkan nomor WhatsApp yang aktif.");
      return;
    }
    if (!customerAddress.trim() || customerAddress.trim().length < 3) {
      setErrorMessage("Harap isi alamat lengkap atau info pengantaran.");
      return;
    }

    startTransition(async () => {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerNotes: customerNotes.trim(),
        paymentMethod,
        paymentProofToken: proofToken || "",
        appOrigin: typeof window !== "undefined" ? window.location.origin : "",
        items: cartItems.map((item) => ({
          cartItemId: item.cartItemId,
          id: item.id,
          type: item.type,
          quantity: item.quantity,
          variantId: item.selectedVariant?.id,
          selectedSauces: item.selectedSauces,
          addonIds: item.extraAddons?.map((a) => a.id),
        })),
      };

      const result = await processCheckoutAction(payload);

      if (!result.success || !result.whatsappUrl) {
        setErrorMessage(result.error || "Gagal membuat link pesanan WhatsApp.");
        return;
      }

      setDirectWhatsappUrl(result.whatsappUrl);
      onSuccessOrder();

      // Open WhatsApp directly
      const opened = window.open(result.whatsappUrl, "_blank");
      if (!opened) {
        window.location.href = result.whatsappUrl;
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#16253D]/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#F6F3EC] w-full max-w-xl rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E2DDD2] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E2DDD2] flex items-center justify-between">
          <div>
            <h2 className="font-black text-base sm:text-lg text-[#16253D]">
              Checkout & Pembayaran
            </h2>
            <span className="text-xs text-[#877259]">
              Total Tagihan:{" "}
              <strong className="text-[#16253D]">{formatRupiah(totalAmount)}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center transition-colors"
            aria-label="Tutup Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. DATA PEMESAN */}
          <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2DDD2]">
            <h3 className="font-black text-xs sm:text-sm text-[#16253D] uppercase tracking-wider">
              1. Data Pemesan
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                Alamat Lengkap / Info Pengantaran <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Contoh: Jl. Katapang No. 12 (Ambil di Toko / Antar ke Rumah)"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                Catatan Pesanan Khusus (Opsional)
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Contoh: Sambal dipisah ya kak"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
              />
            </div>
          </div>

          {/* 2. METODE PEMBAYARAN */}
          <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2DDD2]">
            <h3 className="font-black text-xs sm:text-sm text-[#16253D] uppercase tracking-wider">
              2. Pilih Metode Pembayaran
            </h3>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3">
              {paymentSettings.isBankActive && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "border-[#16253D] bg-[#16253D] text-white shadow-sm"
                      : "border-[#CFC8B8] bg-[#F6F3EC] text-[#4B5E7A] hover:bg-[#EFECE3]"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="font-bold text-xs">Transfer Bank</span>
                  <span className="text-[10px] opacity-80">{paymentSettings.bankName}</span>
                </button>
              )}

              {paymentSettings.isQrisActive && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === "QRIS"
                      ? "border-[#16253D] bg-[#16253D] text-white shadow-sm"
                      : "border-[#CFC8B8] bg-[#F6F3EC] text-[#4B5E7A] hover:bg-[#EFECE3]"
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="font-bold text-xs">QRIS Dinamis</span>
                  <span className="text-[10px] opacity-80">Semua E-Wallet</span>
                </button>
              )}
            </div>

            {/* Bank Details Display */}
            {paymentMethod === "BANK_TRANSFER" && paymentSettings.isBankActive && (
              <div className="p-4 bg-[#F6F3EC] rounded-2xl border border-[#E2DDD2] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#16253D]">
                    {paymentSettings.bankName}
                  </span>
                  <span className="text-[11px] font-bold text-[#877259]">
                    a.n {paymentSettings.accountHolder}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#CFC8B8]">
                  <span className="font-mono font-black text-sm tracking-wider text-[#16253D]">
                    {paymentSettings.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="flex items-center gap-1 px-3 py-1 bg-[#16253D] text-white rounded-lg text-xs font-bold hover:bg-[#1D2D44] transition-colors"
                  >
                    {copiedBank ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Rekening</span>
                      </>
                    )}
                  </button>
                </div>

                {paymentSettings.bankNotes && (
                  <p className="text-[11px] text-[#4B5E7A] italic leading-tight">
                    * {paymentSettings.bankNotes}
                  </p>
                )}
              </div>
            )}

            {/* QRIS Display */}
            {paymentMethod === "QRIS" && paymentSettings.isQrisActive && (
              <div className="p-4 bg-[#F6F3EC] rounded-2xl border border-[#E2DDD2] flex flex-col items-center text-center space-y-3">
                <span className="text-xs font-bold text-[#4B5E7A]">
                  Scan kode QRIS di bawah ini melalui BCA, Mandiri, GoPay, OVO, ShopeePay, DANA:
                </span>
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-white p-2 rounded-2xl border-2 border-[#16253D] shadow-sm">
                  <Image
                    src={paymentSettings.qrisImageUrl || "/images/cireng-kuah.jpg"}
                    alt="QRIS Pembayaran Ciyeng Mamim"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                {paymentSettings.qrisNmid && (
                  <span className="text-[10px] font-mono text-[#877259]">
                    NMID: {paymentSettings.qrisNmid}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 3. UPLOAD BUKTI PEMBAYARAN */}
          <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2DDD2]">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs sm:text-sm text-[#16253D] uppercase tracking-wider">
                3. Upload Bukti Pembayaran
              </h3>
              <span className="text-[11px] text-[#877259] font-bold">
                (Opsional / Bisa kirim di WA)
              </span>
            </div>

            {/* Dropzone Container */}
            <label className="relative border-2 border-dashed border-[#CFC8B8] hover:border-[#16253D] bg-[#F6F3EC] p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />

              {isUploading ? (
                <div className="py-4 flex flex-col items-center gap-2">
                  <Loader2 className="w-7 h-7 text-[#16253D] animate-spin" />
                  <span className="text-xs font-bold text-[#4B5E7A]">
                    Memproses & mengunggah bukti...
                  </span>
                </div>
              ) : proofPreviewUrl ? (
                <div className="py-2 flex flex-col items-center gap-2">
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-[#CFC8B8] shadow-sm">
                    <Image
                      src={proofPreviewUrl}
                      alt="Preview Bukti"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-extrabold text-[#15803D]">
                    ✓ Bukti siap dikirim (Klik untuk ganti)
                  </span>
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#16253D] shadow-2xs group-hover:scale-110 transition-transform border border-[#E2DDD2]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-[#16253D]">
                    Pilih Screenshot / Foto Struk Bayar
                  </span>
                  <span className="text-[11px] text-[#877259]">
                    JPEG, PNG, WEBP (Maksimal 5MB)
                  </span>
                </div>
              )}
            </label>

            {uploadError && (
              <p className="text-xs text-[#D83A2E] font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
              </p>
            )}
          </div>
        </div>

        {/* Sticky Submit Bottom Bar (Always visible) */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E2DDD2] space-y-3">
          {/* Prominent Error Alert */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm p-3.5 rounded-xl font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Direct WhatsApp Click fallback if popup blocked */}
          {directWhatsappUrl && (
            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#EBF1F8] border border-[#16253D] text-[#16253D] font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#D5E2F1]"
            >
              <span>Klik di sini jika WhatsApp tidak terbuka otomatis</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={handleSubmitCheckout}
            disabled={isPending || isUploading}
            className="w-full py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-sm sm:text-base rounded-full shadow-lg flex items-center justify-center gap-2.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#1EBE5D]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menghubungkan ke WhatsApp Toko...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                <span>Kirim Pesanan via WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
