"use client";

import { PackageItem } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import { Plus, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface PackageCardProps {
  packageItem: PackageItem;
  onSelect: (packageItem: PackageItem) => void;
}

export function PackageCard({ packageItem, onSelect }: PackageCardProps) {
  return (
    <div className="food-card bg-white border border-[#E2DDD2] hover:border-[#16253D] p-3 sm:p-5 flex flex-col justify-between group transition-all shadow-xs relative overflow-hidden rounded-2xl sm:rounded-3xl">
      <div>
        <div className="relative w-full h-32 sm:h-52 rounded-xl sm:rounded-2xl overflow-hidden bg-[#EFECE3] mb-2.5 sm:mb-4">
          <Image
            src={packageItem.imageUrl}
            alt={packageItem.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 380px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!packageItem.isAvailable && (
            <div className="absolute inset-0 bg-[#16253D]/75 backdrop-blur-xs flex items-center justify-center p-1 text-center">
              <span className="px-2.5 py-1 bg-[#B91C1C] text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-full shadow-md">
                Habis
              </span>
            </div>
          )}
        </div>

        {/* Package Title & Description */}
        <h3 className="font-black text-sm sm:text-xl text-[#16253D] mb-0.5 sm:mb-1 line-clamp-1 group-hover:text-[#1D2D44] transition-colors">
          {packageItem.name}
        </h3>
        <p className="text-[10px] sm:text-sm text-[#2C3E5A] font-bold mb-2 sm:mb-4 line-clamp-1">
          {packageItem.description || "Bebas pilih varian rasa"}
        </p>

        {/* Package Included Items */}
        <div className="space-y-1 mb-3 sm:mb-5 bg-[#F6F3EC] p-2 sm:p-3 rounded-xl border border-[#E2DDD2]">
          {packageItem.packageItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1 text-[10px] sm:text-xs font-bold text-[#16253D]">
              <CheckCircle2 className="w-3 h-3 text-[#15803D] shrink-0 mt-0.5" />
              <span className="line-clamp-1">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Price & Select Button */}
      <div className="pt-2 sm:pt-3 border-t border-[#EFECE3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
        <div>
          <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-[#5C4028] block tracking-wider">
            Total Harga
          </span>
          <span className="text-sm sm:text-xl font-black text-[#16253D]">
            {formatRupiah(packageItem.price)}
          </span>
        </div>

        <button
          onClick={() => onSelect(packageItem)}
          disabled={!packageItem.isAvailable}
          className={`w-full sm:w-auto flex items-center justify-center gap-1 px-3 sm:px-5 py-2 sm:py-2.5 min-h-[36px] sm:min-h-[44px] rounded-full font-black text-xs sm:text-sm transition-all active:scale-95 ${
            packageItem.isAvailable
              ? "bg-[#16253D] hover:bg-[#1D2D44] text-white shadow-md glow-navy border border-[#2C3E5A]"
              : "bg-[#E2DDD2] text-[#4B5E7A] cursor-not-allowed"
          }`}
          aria-label={`Pilih paket ${packageItem.name}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Pilih</span>
        </button>
      </div>
    </div>
  );
}
