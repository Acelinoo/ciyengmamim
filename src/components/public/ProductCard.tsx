"use client";

import { ProductItem } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import { Plus } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <div className="food-card bg-white border border-[#E2DDD2] hover:border-[#16253D] p-3 sm:p-5 flex flex-col justify-between group transition-all rounded-2xl sm:rounded-3xl">
      <div>
        {/* Product Image Container */}
        <div className="relative w-full h-32 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden bg-[#EFECE3] mb-2.5 sm:mb-4">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 380px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-[#16253D]/75 backdrop-blur-xs flex items-center justify-center p-1 text-center">
              <span className="px-2.5 py-1 bg-[#B91C1C] text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-full shadow-md">
                Habis
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <h3 className="font-black text-sm sm:text-lg text-[#16253D] mb-1 line-clamp-1 group-hover:text-[#1D2D44] transition-colors">
          {product.name}
        </h3>
        <p className="text-[11px] sm:text-sm text-[#2C3E5A] line-clamp-2 leading-relaxed mb-3 sm:mb-4 font-medium">
          {product.description}
        </p>
      </div>

      {/* Price & Add to Cart Trigger */}
      <div className="pt-2 sm:pt-3 border-t border-[#EFECE3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
        <div>
          <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-[#5C4028] block tracking-wider">
            Harga Satuan
          </span>
          <span className="text-sm sm:text-lg font-black text-[#16253D]">
            {formatRupiah(product.price)}
          </span>
        </div>

        <button
          onClick={() => onSelect(product)}
          disabled={!product.isAvailable}
          className={`w-full sm:w-auto flex items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[36px] sm:min-h-[44px] rounded-full font-black text-xs sm:text-sm transition-all active:scale-95 ${
            product.isAvailable
              ? "bg-[#16253D] hover:bg-[#1D2D44] text-white shadow-sm border border-[#2C3E5A]"
              : "bg-[#E2DDD2] text-[#4B5E7A] cursor-not-allowed"
          }`}
          aria-label={`Pilih menu ${product.name}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Pilih</span>
        </button>
      </div>
    </div>
  );
}
