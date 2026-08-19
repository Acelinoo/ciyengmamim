"use client";

import { ShoppingBag, MessageCircle } from "lucide-react";
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo with Gambar 1 Icon */}
        <a
          href="#"
          aria-label="Ciyeng Mamim — Beranda"
          className="flex items-center gap-3 group min-h-[44px]"
        >
          <div className="relative w-11 h-11 md:w-13 md:h-13 rounded-2xl overflow-hidden bg-[#16253D] shadow-sm transform group-hover:scale-105 transition-transform border border-[#2C3E5A] p-0.5 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Logo Ciyeng Mamim"
              fill
              sizes="52px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl md:text-2xl font-black tracking-tight text-[#16253D] block font-display leading-tight">
                ciyeng mamim
              </span>
            </div>
            <span className="text-[10px] md:text-xs text-[#5C4028] font-extrabold tracking-wider uppercase flex items-center gap-1">
              Balikin Mood with Good Food ♡
            </span>
          </div>
        </a>

        {/* Desktop Quick Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-[#2C3E5A]">
          <a href="#paket" className="hover:text-[#16253D] transition-colors py-2">
            Paket Hemat
          </a>
          <a href="#menu" className="hover:text-[#16253D] transition-colors py-2">
            Katalog Menu
          </a>
          <a href="#sauce" className="hover:text-[#16253D] transition-colors py-2">
            Aneka Saus
          </a>
          <a href="#lokasi" className="hover:text-[#16253D] transition-colors py-2">
            Lokasi Soreang
          </a>
        </nav>

        {/* Action Buttons: WhatsApp & Cart Trigger */}
        <div className="flex items-center gap-2.5">
          {/* Direct WhatsApp Question */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              "Halo Ciyeng Mamim, saya ingin tanya seputar menu hari ini di GC Kuliner Soreang 🙏"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tanya Toko Ciyeng Mamim via WhatsApp"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-full border border-[#CFC8B8] bg-white text-xs font-bold text-[#16253D] hover:bg-[#EFECE3] hover:border-[#16253D] transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Tanya Toko</span>
          </a>

          {/* Cart Trigger Pill Button */}
          <button
            onClick={onOpenCart}
            id="cart-trigger-btn"
            className="flex items-center gap-2.5 px-4 py-2.5 md:py-3 min-h-[44px] bg-[#16253D] hover:bg-[#1D2D44] text-white rounded-full font-black text-xs md:text-sm active:scale-95 transition-all shadow-md glow-navy border border-[#2C3E5A]"
            aria-label="Buka Keranjang Belanja"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#EAA623]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#D83A2E] text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span>
              {totalCartCount > 0 ? formatRupiah(totalCartAmount) : "Keranjang"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
