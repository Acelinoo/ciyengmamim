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
    <div className="food-card bg-white border border-[#E2DDD2] hover:border-[#16253D] p-4 sm:p-5 flex flex-col justify-between group transition-all">
      <div>
        {/* Product Image Container */}
        <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-[#EFECE3] mb-4">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-[#16253D]/75 backdrop-blur-xs flex items-center justify-center">
              <span className="px-3.5 py-1.5 bg-[#B91C1C] text-white font-black text-xs uppercase tracking-wider rounded-full shadow-md">
                Habis Hari Ini
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <h3 className="font-black text-base sm:text-lg text-[#16253D] mb-1.5 line-clamp-1 group-hover:text-[#1D2D44] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-[#2C3E5A] line-clamp-2 leading-relaxed mb-4 font-medium">
          {product.description}
        </p>
      </div>

      {/* Price & Add to Cart Trigger */}
      <div className="pt-3 border-t border-[#EFECE3] flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-extrabold text-[#5C4028] block tracking-wider">
            Harga Satuan
          </span>
          <span className="text-base sm:text-lg font-black text-[#16253D]">
            {formatRupiah(product.price)}
          </span>
        </div>

        <button
          onClick={() => onSelect(product)}
          disabled={!product.isAvailable}
          className={`flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] min-w-[80px] justify-center rounded-full font-black text-xs sm:text-sm transition-all active:scale-95 ${
            product.isAvailable
              ? "bg-[#16253D] hover:bg-[#1D2D44] text-white shadow-sm border border-[#2C3E5A]"
              : "bg-[#E2DDD2] text-[#4B5E7A] cursor-not-allowed"
          }`}
          aria-label={`Pilih menu ${product.name}`}
        >
          <Plus className="w-4 h-4" />
          <span>Pilih</span>
        </button>
      </div>
    </div>
  );
}
