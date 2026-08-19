"use client";

import { useState, useEffect } from "react";
import { ProductItem, PackageItem, AddOnItem, CartItem, VariantOptionType } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import { X, Plus, Minus, Check } from "lucide-react";
import Image from "next/image";

interface ProductCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProductItem | PackageItem | null;
  itemType: "PRODUCT" | "PACKAGE";
  availableAddons: AddOnItem[];
  onAddToCart: (cartItem: CartItem) => void;
}

export function ProductCustomizerModal({
  isOpen,
  onClose,
  item,
  itemType,
  availableAddons,
  onAddToCart,
}: ProductCustomizerModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<VariantOptionType | undefined>(undefined);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedAddonIds([]);

      if (itemType === "PRODUCT") {
        const prod = item as ProductItem;
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        } else {
          setSelectedVariant(undefined);
        }
        setSelectedSauces([]);
      } else {
        const pkg = item as PackageItem;
        setSelectedVariant(undefined);
        if (pkg.includedSauces && pkg.includedSauces.length > 0) {
          setSelectedSauces([pkg.includedSauces[0]]);
        } else {
          setSelectedSauces([]);
        }
      }
    }
  }, [item, itemType]);

  if (!isOpen || !item) return null;

  let unitPrice = item.price;
  if (selectedVariant) {
    unitPrice += selectedVariant.price;
  }

  const activeAddons = availableAddons.filter((a) => selectedAddonIds.includes(a.id));
  const addonsTotal = activeAddons.reduce((sum, a) => sum + a.price, 0);

  const finalUnitPrice = unitPrice + addonsTotal;
  const totalPrice = finalUnitPrice * quantity;

  const handleSauceToggle = (sauceName: string) => {
    if (selectedSauces.includes(sauceName)) {
      if (selectedSauces.length > 1) {
        setSelectedSauces(selectedSauces.filter((s) => s !== sauceName));
      }
    } else {
      setSelectedSauces([...selectedSauces, sauceName]);
    }
  };

  const handleAddonToggle = (addonId: string) => {
    if (selectedAddonIds.includes(addonId)) {
      setSelectedAddonIds(selectedAddonIds.filter((id) => id !== addonId));
    } else {
      setSelectedAddonIds([...selectedAddonIds, addonId]);
    }
  };

  const handleConfirmAdd = () => {
    const uniqueCartId = `${item.id}-${selectedVariant?.id || "novar"}-${selectedSauces.sort().join("_")}-${selectedAddonIds.sort().join("_")}-${Date.now()}`;

    const newCartItem: CartItem = {
      cartItemId: uniqueCartId,
      id: item.id,
      type: itemType,
      name: item.name,
      price: finalUnitPrice,
      imageUrl: item.imageUrl,
      quantity,
      selectedVariant,
      selectedSauces: itemType === "PACKAGE" ? selectedSauces : undefined,
      extraAddons: activeAddons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
    };

    onAddToCart(newCartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#16253D]/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#F6F3EC] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E2DDD2] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="relative p-4 sm:p-5 border-b border-[#E2DDD2] bg-white flex items-center justify-between">
          <h2 className="font-black text-base sm:text-lg text-[#16253D] pr-8 line-clamp-1">
            Kustomisasi Pesanan
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center transition-colors"
            aria-label="Tutup jendela kustomisasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Product Overview Header */}
          <div className="flex gap-4 items-center bg-white p-3.5 rounded-2xl border border-[#E2DDD2]">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#EFECE3] shrink-0">
              <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#5C4028] uppercase tracking-wider block">
                {itemType === "PACKAGE" ? "Paket Bundling" : "Menu Cireng"}
              </span>
              <h3 className="font-black text-sm sm:text-base text-[#16253D] line-clamp-1">
                {item.name}
              </h3>
              <span className="text-sm sm:text-base font-black text-[#16253D]">
                {formatRupiah(item.price)}
              </span>
            </div>
          </div>

          {/* 1. Variant Selection */}
          {itemType === "PRODUCT" && (item as ProductItem).variants && (item as ProductItem).variants!.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-black text-xs sm:text-sm text-[#16253D]">
                  Pilih Varian:
                </span>
                <span className="text-[11px] font-black text-[#5C4028]">Wajib 1</span>
              </div>
              <div className="space-y-2">
                {(item as ProductItem).variants!.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all min-h-[44px] ${
                        isSelected
                          ? "bg-white border-[#16253D] ring-2 ring-[#16253D]/10 shadow-sm"
                          : "bg-white border-[#E2DDD2] hover:border-[#CFC8B8]"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold text-[#16253D]">
                        {variant.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {variant.price > 0 && (
                          <span className="text-xs font-bold text-[#5C4028]">
                            +{formatRupiah(variant.price)}
                          </span>
                        )}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected
                              ? "bg-[#16253D] border-[#16253D] text-white"
                              : "border-[#CFC8B8]"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Included Sauces Selection */}
          {itemType === "PACKAGE" && (item as PackageItem).includedSauces && (item as PackageItem).includedSauces.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-black text-xs sm:text-sm text-[#16253D]">
                  Pilih Saus Termasuk Paket:
                </span>
                <span className="text-[11px] font-bold text-[#15803D]">Bisa pilih lebih dari 1</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(item as PackageItem).includedSauces.map((sauce) => {
                  const isSelected = selectedSauces.includes(sauce);
                  return (
                    <button
                      key={sauce}
                      type="button"
                      onClick={() => handleSauceToggle(sauce)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all min-h-[44px] ${
                        isSelected
                          ? "bg-white border-[#16253D] ring-2 ring-[#16253D]/10 shadow-sm"
                          : "bg-white border-[#E2DDD2] hover:border-[#CFC8B8]"
                      }`}
                    >
                      <span className="text-xs font-bold text-[#16253D] pr-2 line-clamp-1">
                        {sauce}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? "bg-[#16253D] border-[#16253D] text-white"
                            : "border-[#CFC8B8]"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Extra Add-on & Sauces */}
          {availableAddons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-black text-xs sm:text-sm text-[#16253D]">
                  Tambah Ekstra Saus / Kuah:
                </span>
                <span className="text-[11px] font-bold text-[#5C4028]">Opsional</span>
              </div>
              <div className="space-y-2">
                {availableAddons.map((addon) => {
                  const isSelected = selectedAddonIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => handleAddonToggle(addon.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all min-h-[44px] ${
                        isSelected
                          ? "bg-white border-[#16253D] ring-2 ring-[#16253D]/15 shadow-sm"
                          : "bg-white border-[#E2DDD2] hover:border-[#CFC8B8]"
                      }`}
                    >
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-[#16253D] block">
                          {addon.name}
                        </span>
                        <span className="text-[11px] text-[#2C3E5A]">
                          {addon.description || "Cup saus ekstra nikmat"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#5C4028]">
                          +{formatRupiah(addon.price)}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? "bg-[#16253D] border-[#16253D] text-white"
                              : "border-[#CFC8B8]"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Quantity Stepper */}
          <div className="pt-3 border-t border-[#E2DDD2] flex items-center justify-between">
            <span className="font-black text-xs sm:text-sm text-[#16253D]">
              Jumlah Porsi:
            </span>
            <div className="flex items-center gap-3 bg-white p-1 rounded-full border border-[#E2DDD2] shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center font-bold"
                aria-label="Kurangi jumlah porsi"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-black text-sm text-[#16253D]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-full bg-[#16253D] hover:bg-[#1D2D44] text-white flex items-center justify-center font-bold"
                aria-label="Tambah jumlah porsi"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer CTA */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E2DDD2] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-[#5C4028] block tracking-wider">
              Total Harga
            </span>
            <span className="text-lg sm:text-xl font-black text-[#16253D]">
              {formatRupiah(totalPrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirmAdd}
            className="flex-1 sm:flex-initial min-h-[48px] px-6 py-3.5 bg-[#16253D] hover:bg-[#1D2D44] text-white font-black text-xs sm:text-sm rounded-full shadow-lg glow-navy active:scale-95 transition-all text-center border border-[#2C3E5A]"
          >
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
