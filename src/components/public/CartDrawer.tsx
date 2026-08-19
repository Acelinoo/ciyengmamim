"use client";

import { CartItem } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#16253D]/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-md bg-[#F6F3EC] h-full flex flex-col shadow-2xl border-l border-[#E2DDD2] animate-slide-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E2DDD2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EBF1F8] flex items-center justify-center text-[#16253D]">
              <ShoppingBag className="w-4 h-4 text-[#EAA623]" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-[#16253D]">
                Keranjang Belanja
              </h2>
              <span className="text-xs text-[#877259] font-bold">
                {totalItemCount} item dipilih
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center transition-colors"
            aria-label="Tutup Keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-white rounded-3xl border border-[#E2DDD2] flex items-center justify-center text-4xl shadow-sm mb-4 transform -rotate-3">
              🥟
            </div>
            <h3 className="font-black text-lg text-[#16253D] mb-1">
              Keranjangmu Masih Kosong
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5E7A] max-w-xs mb-6 leading-relaxed">
              Yuk pilih cireng crispy dan saus favoritmu di Ciyeng Mamim!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#16253D] hover:bg-[#1D2D44] text-white font-black text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 border border-[#2C3E5A]"
            >
              Lihat Menu Cireng
            </button>
          </div>
        ) : (
          /* Cart Item List */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white p-3.5 rounded-2xl border border-[#E2DDD2] shadow-2xs flex gap-3 items-start"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#EFECE3] shrink-0">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-black text-xs sm:text-sm text-[#16253D] truncate">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="text-[#A0AEC0] hover:text-[#D83A2E] p-1 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Badges / Options summary */}
                  <div className="mt-1 space-y-0.5 text-[11px] text-[#4B5E7A]">
                    {item.selectedVariant && (
                      <span className="block text-[#7D5836] font-bold">
                        • {item.selectedVariant.name}
                      </span>
                    )}
                    {item.selectedSauces && item.selectedSauces.length > 0 && (
                      <span className="block text-[#15803D] font-bold truncate">
                        • Saus: {item.selectedSauces.join(", ")}
                      </span>
                    )}
                    {item.extraAddons && item.extraAddons.length > 0 && (
                      <span className="block text-[#16253D] font-bold truncate">
                        • Ekstra: {item.extraAddons.map((a) => a.name).join(", ")}
                      </span>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EFECE3]">
                    <span className="text-xs sm:text-sm font-black text-[#16253D]">
                      {formatRupiah(item.price * item.quantity)}
                    </span>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-[#F6F3EC] p-0.5 rounded-full border border-[#E2DDD2]">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-white hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center font-bold"
                        aria-label="Kurang"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-black text-xs text-[#16253D]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-[#16253D] hover:bg-[#1D2D44] text-white flex items-center justify-center font-bold"
                        aria-label="Tambah"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drawer Sticky Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#E2DDD2] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#877259]">
              <span>Subtotal ({totalItemCount} Porsi)</span>
              <span className="font-bold text-[#16253D]">{formatRupiah(totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base font-black text-[#16253D] pt-1">
              <span>Total Pembayaran</span>
              <span className="text-lg sm:text-xl text-[#16253D]">{formatRupiah(totalAmount)}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
              className="w-full py-4 bg-[#16253D] hover:bg-[#1D2D44] text-white font-black text-sm rounded-full shadow-lg glow-navy flex items-center justify-center gap-2 active:scale-95 transition-all border border-[#2C3E5A]"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
