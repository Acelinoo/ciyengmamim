"use client";

import { useState, useTransition } from "react";
import { CartItem, PaymentSettingsType } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import { processCheckoutAction } from "@/app/actions/checkout";
import {
  X,
  MessageCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  paymentSettings?: PaymentSettingsType;
  onSuccessOrder: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onSuccessOrder,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [directWhatsappUrl, setDirectWhatsappUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleSubmitCheckout = () => {
    setErrorMessage(null);
    setDirectWhatsappUrl(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage("Harap masukkan nama lengkap pemesan (minimal 2 karakter).");
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage("Harap masukkan nomor WhatsApp yang aktif (minimal 8 digit).");
      return;
    }
    if (!customerAddress.trim() || customerAddress.trim().length < 3) {
      setErrorMessage("Harap isi alamat lengkap atau info pengantaran/ambil di toko.");
      return;
    }

    startTransition(async () => {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerNotes: customerNotes.trim(),
        paymentMethod: "WHATSAPP" as const,
        paymentProofToken: "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#16253D]/75 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#F6F3EC] w-full max-w-lg rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E2DDD2] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E2DDD2] flex items-center justify-between">
          <div>
            <h2 id="checkout-modal-title" className="font-black text-base sm:text-lg text-[#16253D]">
              Data Pemesan & Checkout
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[#5C4028] font-bold">
                Total Tagihan:{" "}
                <strong className="text-[#16253D] text-sm">{formatRupiah(totalAmount)}</strong>
              </span>
              <span className="text-[11px] text-[#877259] font-medium">
                ({totalItemCount} item)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center transition-colors"
            aria-label="Tutup formulir checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Order Summary Snapshot */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2DDD2] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#16253D] uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#5C4028]" />
                <span>Ringkasan Menu</span>
              </span>
              <span className="text-xs font-black text-[#16253D]">
                {formatRupiah(totalAmount)}
              </span>
            </div>
            <div className="divide-y divide-[#F6F3EC] max-h-28 overflow-y-auto pr-1 space-y-1">
              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="pt-1 first:pt-0 flex items-center justify-between text-xs text-[#2C3E5A]"
                >
                  <span className="truncate pr-2 font-medium">
                    <strong className="text-[#16253D]">{item.quantity}x</strong> {item.name}
                    {item.selectedVariant && ` (${item.selectedVariant.name})`}
                  </span>
                  <span className="font-bold shrink-0 text-[#16253D]">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Data Pemesan */}
          <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2DDD2]">
            <h3 className="font-black text-xs sm:text-sm text-[#16253D] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#5C4028]" />
              <span>Informasi Pemesan</span>
            </h3>

            {/* Nama Lengkap */}
            <div>
              <label
                htmlFor="checkout-name"
                className="block text-xs font-bold text-[#2C3E5A] mb-1 flex items-center gap-1"
              >
                <span>Nama Lengkap</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="checkout-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
                  required
                />
              </div>
            </div>

            {/* Nomor WhatsApp */}
            <div>
              <label
                htmlFor="checkout-phone"
                className="block text-xs font-bold text-[#2C3E5A] mb-1 flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-[#5C4028]" />
                <span>Nomor WhatsApp Aktif</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                id="checkout-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
                required
              />
            </div>

            {/* Alamat / Pengantaran */}
            <div>
              <label
                htmlFor="checkout-address"
                className="block text-xs font-bold text-[#2C3E5A] mb-1 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-[#5C4028]" />
                <span>Alamat Lengkap / Info Pengantaran</span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="checkout-address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Contoh: Jl. Katapang No. 12 (Ambil di Toko / Antar ke Rumah)"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
                required
              />
            </div>

            {/* Catatan Khusus */}
            <div>
              <label
                htmlFor="checkout-notes"
                className="block text-xs font-bold text-[#2C3E5A] mb-1 flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-[#5C4028]" />
                <span>Catatan Khusus (Opsional)</span>
              </label>
              <input
                id="checkout-notes"
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Contoh: Sambal dipisah ya kak, jangan terlalu pedas"
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
              />
            </div>
          </div>

          {/* Friendly Instant Order Notification */}
          <div className="bg-[#EBF1F8] p-3.5 sm:p-4 rounded-2xl border border-[#D5E2F1] text-xs text-[#16253D] space-y-1">
            <div className="flex items-center gap-1.5 font-black text-[#1D2D44]">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Pemesanan Langsung via WhatsApp</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#2C3E5A] leading-relaxed">
              Setelah menekan tombol di bawah, pesanan Anda akan otomatis dirangkai dan dikirimkan ke chat WhatsApp Ciyeng Mamim untuk konfirmasi ketersediaan dan metode pembayaran.
            </p>
          </div>
        </div>

        {/* Sticky Submit Bottom Bar */}
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
            disabled={isPending}
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
