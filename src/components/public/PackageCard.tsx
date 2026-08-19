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
    <div className="food-card bg-white border border-[#E2DDD2] hover:border-[#16253D] p-5 flex flex-col justify-between group transition-all shadow-xs relative overflow-hidden">
      <div>
        <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-[#EFECE3] mb-4">
          <Image
            src={packageItem.imageUrl}
            alt={packageItem.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!packageItem.isAvailable && (
            <div className="absolute inset-0 bg-[#16253D]/75 backdrop-blur-xs flex items-center justify-center">
              <span className="px-3.5 py-1.5 bg-[#B91C1C] text-white font-black text-xs uppercase tracking-wider rounded-full shadow-md">
                Habis Hari Ini
              </span>
            </div>
          )}
        </div>

        {/* Package Title & Description */}
        <h3 className="font-black text-xl text-[#16253D] mb-1 group-hover:text-[#1D2D44] transition-colors">
          {packageItem.name}
        </h3>
        <p className="text-xs sm:text-sm text-[#2C3E5A] font-bold mb-4">
          {packageItem.description || "Bebas pilih varian rasa"}
        </p>

        {/* Package Included Items */}
        <div className="space-y-1.5 mb-5 bg-[#F6F3EC] p-3 rounded-xl border border-[#E2DDD2]">
          {packageItem.packageItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs font-bold text-[#16253D]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Price & Select Button */}
      <div className="pt-3 border-t border-[#EFECE3] flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-extrabold text-[#5C4028] block tracking-wider">
            Total Harga
          </span>
          <span className="text-lg sm:text-xl font-black text-[#16253D]">
            {formatRupiah(packageItem.price)}
          </span>
        </div>

        <button
          onClick={() => onSelect(packageItem)}
          disabled={!packageItem.isAvailable}
          className={`flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-full font-black text-xs sm:text-sm transition-all active:scale-95 ${
            packageItem.isAvailable
              ? "bg-[#16253D] hover:bg-[#1D2D44] text-white shadow-md glow-navy border border-[#2C3E5A]"
              : "bg-[#E2DDD2] text-[#4B5E7A] cursor-not-allowed"
          }`}
          aria-label={`Pilih paket ${packageItem.name}`}
        >
          <Plus className="w-4 h-4" />
          <span>Pilih</span>
        </button>
      </div>
    </div>
  );
}
