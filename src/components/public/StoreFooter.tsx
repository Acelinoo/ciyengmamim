"use client";

import { StoreSettingsType, OperationalSettingsType } from "@/types";
import { MapPin, Clock, MessageCircle, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface StoreFooterProps {
  store: StoreSettingsType;
  operational: OperationalSettingsType;
}

export function StoreFooter({ store, operational }: StoreFooterProps) {
  return (
    <footer id="lokasi" className="bg-[#0E1B2E] text-white border-t border-[#1D2D44] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-[#16253D] p-0.5 border border-[#2C3E5A] shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Logo Ciyeng Mamim"
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white font-display block">
                  ciyeng mamim
                </span>
                <span className="text-[10px] text-[#EAA623] font-bold">
                  Balikin Mood with Good Food ♡
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Cireng crispy renyah isi Ayam Rica, Sapi Teriyaki, Paru Rica, Pizza, dan Keju Cheddar. Termasuk Creamy Ranch Sauce lezat. Fresh setiap hari!
            </p>
            {/* Social icons with 44x44px touch targets */}
            <div className="flex items-center gap-3 pt-2">
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-[#1D2D44] hover:bg-[#EAA623] hover:text-[#16253D] flex items-center justify-center text-white transition-colors border border-[#2C3E5A]"
                  aria-label="Kunjungi Akun Instagram Ciyeng Mamim"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              <a
                href={`https://wa.me/${store.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-[#1D2D44] hover:bg-[#25D366] flex items-center justify-center text-white transition-colors border border-[#2C3E5A]"
                aria-label="Hubungi WhatsApp Toko Ciyeng Mamim"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#EAA623]" />
              <span>Jam Operasional Toko</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Buka setiap hari:{" "}
              <strong className="text-white">
                {operational.openTime} - {operational.closeTime} WIB
              </strong>
            </p>
            {operational.closedDays && operational.closedDays.length > 0 && (
              <p className="text-xs text-[#F87171] font-bold">
                Libur rutin: {operational.closedDays.join(", ")}
              </p>
            )}
            <p className="text-[11px] text-[#94A3B8] pt-1">
              Pesanan online langsung diteruskan ke WhatsApp toko.
            </p>
          </div>

          {/* Location & Maps */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#EAA623]" />
              <span>Lokasi Soreang</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              {store.address || "Jl. Raya Gading Tutuka, GC Kuliner Pujasera, Soreang, Bandung"}
            </p>
            {store.mapsUrl && (
              <a
                href={store.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Buka Lokasi Ciyeng Mamim di Google Maps Soreang"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EAA623] hover:underline pt-1 min-h-[36px]"
              >
                <span>Buka di Google Maps Soreang</span>
                <span>➔</span>
              </a>
            )}
          </div>
        </div>

        {/* Subfooter */}
        <div className="mt-12 pt-6 border-t border-[#1D2D44] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <p>© 2026 {store.storeName} — Balikin Mood with Good Food ♡. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              aria-label="Halaman Login Panel Admin"
              className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1.5 py-1 px-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
