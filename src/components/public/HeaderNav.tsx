"use client";

import { ShoppingBag, MessageCircle, Star } from "lucide-react";
import { formatRupiah } from "@/lib/whatsapp";
import Image from "next/image";

interface HeaderNavProps {
  storeName: string;
  totalCartCount: number;
  totalCartAmount: number;
  onOpenCart: () => void;
  whatsappNumber: string;
}

export function HeaderNav({
  storeName,
  totalCartCount,
  totalCartAmount,
  onOpenCart,
  whatsappNumber,
}: HeaderNavProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#F6F3EC]/95 backdrop-blur-md border-b border-[#E2DDD2] transition-all shadow-2xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Title */}
        <a
          href="#"
          aria-label="Ciyeng Mamim — Beranda"
          className="flex items-center gap-2 sm:gap-3 group min-h-[44px] min-w-0"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-[#16253D] shadow-sm group-hover:scale-105 transition-transform border border-[#2C3E5A] p-0.5 shrink-0">
            <Image
              src="/images/logo.webp"
              alt="Logo Ciyeng Mamim"
              fill
              sizes="48px"
              className="object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-[#16253D] block font-display leading-tight truncate">
                ciyeng mamim
              </span>
              <span className="px-1.5 py-0.5 bg-[#16253D] text-[#EAA623] text-[8.5px] sm:text-[9px] font-black rounded-md tracking-wider shrink-0">
                Since 2007
              </span>
            </div>
            <span className="text-[9px] sm:text-[11px] md:text-xs text-[#5C4028] font-black tracking-wide block truncate mt-0.5">
              ✨ Lezatnya gaya Resto ✨
            </span>
          </div>
        </a>

        {/* Desktop Quick Nav */}
        <nav className="hidden md:flex items-center gap-1 text-xs lg:text-sm font-bold text-[#2C3E5A]">
          <a
            href="#paket"
            className="px-3.5 py-2 rounded-full hover:bg-white/80 hover:text-[#16253D] border border-transparent hover:border-[#E2DDD2] transition-all"
          >
            Paket Hemat
          </a>
          <a
            href="#menu"
            className="px-3.5 py-2 rounded-full hover:bg-white/80 hover:text-[#16253D] border border-transparent hover:border-[#E2DDD2] transition-all"
          >
            Katalog Menu
          </a>
          <a
            href="#sauce"
            className="px-3.5 py-2 rounded-full hover:bg-white/80 hover:text-[#16253D] border border-transparent hover:border-[#E2DDD2] transition-all"
          >
            Aneka Saus
          </a>
          <a
            href="#ulasan"
            className="px-3.5 py-2 rounded-full hover:bg-white/80 hover:text-[#16253D] border border-transparent hover:border-[#E2DDD2] transition-all inline-flex items-center gap-1 text-[#5C4028]"
          >
            <Star className="w-3.5 h-3.5 fill-[#EAA623] text-[#EAA623]" />
            <span>Ulasan Google</span>
          </a>
          <a
            href="#lokasi"
            className="px-3.5 py-2 rounded-full hover:bg-white/80 hover:text-[#16253D] border border-transparent hover:border-[#E2DDD2] transition-all"
          >
            Lokasi Soreang
          </a>
        </nav>

        {/* Action Buttons: WhatsApp & Cart Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Direct WhatsApp Question */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              "Halo Ciyeng Mamim, saya ingin tanya seputar menu hari ini di GC Kuliner Soreang 🙏"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tanya Toko Ciyeng Mamim via WhatsApp"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-full border border-[#CFC8B8] bg-white text-xs font-bold text-[#16253D] hover:bg-[#EFECE3] hover:border-[#16253D] transition-all shadow-2xs active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Tanya Toko</span>
          </a>

          {/* Cart Trigger Button */}
          <button
            onClick={onOpenCart}
            id="cart-trigger-btn"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 min-h-[40px] sm:min-h-[44px] bg-[#16253D] hover:bg-[#1D2D44] text-white rounded-full font-black text-xs md:text-sm active:scale-95 transition-all shadow-md glow-navy border border-[#2C3E5A]"
            aria-label="Buka Keranjang Belanja"
          >
            <div className="relative shrink-0">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#EAA623]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 bg-[#D83A2E] text-white text-[9.5px] font-black rounded-full flex items-center justify-center animate-bounce shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="font-extrabold whitespace-nowrap">
              {totalCartCount > 0 ? formatRupiah(totalCartAmount) : "Keranjang"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Quick Category Strip (Under navbar on small screens) */}
      <div className="md:hidden flex items-center gap-1 px-3 py-1.5 overflow-x-auto scrollbar-none border-t border-[#E2DDD2]/60 bg-[#EFECE3]/60 text-[11px] font-bold text-[#2C3E5A]">
        <a
          href="#paket"
          className="px-2.5 py-1 rounded-full bg-white/70 border border-[#E2DDD2] whitespace-nowrap active:bg-[#16253D] active:text-white transition-colors"
        >
          Paket
        </a>
        <a
          href="#menu"
          className="px-2.5 py-1 rounded-full bg-white/70 border border-[#E2DDD2] whitespace-nowrap active:bg-[#16253D] active:text-white transition-colors"
        >
          Menu Cireng
        </a>
        <a
          href="#sauce"
          className="px-2.5 py-1 rounded-full bg-white/70 border border-[#E2DDD2] whitespace-nowrap active:bg-[#16253D] active:text-white transition-colors"
        >
          Saus
        </a>
        <a
          href="#ulasan"
          className="px-2.5 py-1 rounded-full bg-white/70 border border-[#E2DDD2] whitespace-nowrap active:bg-[#16253D] active:text-white transition-colors inline-flex items-center gap-1 text-[#5C4028]"
        >
          <span>⭐</span>
          <span>Ulasan</span>
        </a>
        <a
          href="#lokasi"
          className="px-2.5 py-1 rounded-full bg-white/70 border border-[#E2DDD2] whitespace-nowrap active:bg-[#16253D] active:text-white transition-colors"
        >
          Lokasi
        </a>
      </div>
    </header>
  );
}

