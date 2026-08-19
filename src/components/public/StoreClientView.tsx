"use client";

import { useState, useEffect } from "react";
import {
  ProductItem,
  PackageItem,
  AddOnItem,
  StoreSettingsType,
  OperationalSettingsType,
  PaymentSettingsType,
  CartItem,
} from "@/types";
import { LiveOperationalStatus } from "@/lib/operational";
import { OperationalBanner } from "./OperationalBanner";
import { HeaderNav } from "./HeaderNav";
import { HeroSection } from "./HeroSection";
import { ProductCard } from "./ProductCard";
import { PackageCard } from "./PackageCard";
import { ProductCustomizerModal } from "./ProductCustomizerModal";
import { CartDrawer } from "./CartDrawer";
import { CheckoutModal } from "./CheckoutModal";
import { StoreFooter } from "./StoreFooter";
import { formatRupiah } from "@/lib/whatsapp";

interface StoreClientViewProps {
  store: StoreSettingsType;
  operational: OperationalSettingsType;
  payment: PaymentSettingsType;
  products: ProductItem[];
  packages: PackageItem[];
  addons: AddOnItem[];
  operationalStatus: LiveOperationalStatus;
}

export function StoreClientView({
  store,
  operational,
  payment,
  products,
  packages,
  addons,
  operationalStatus,
}: StoreClientViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customizerItem, setCustomizerItem] = useState<{
    item: ProductItem | PackageItem;
    type: "PRODUCT" | "PACKAGE";
  } | null>(null);

  const [activeCategory, setActiveCategory] = useState<"ALL" | "PACKAGES" | "PRODUCTS" | "ADDONS">(
    "ALL"
  );

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem("ciyengmamim_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("ciyengmamim_cart", JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.cartItemId === newItem.cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem("ciyengmamim_cart");
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-[#16253D]">
      {/* 1. Operational Banner */}
      <OperationalBanner status={operationalStatus} />

      {/* 2. Sticky Header Navbar */}
      <HeaderNav
        storeName={store.storeName}
        totalCartCount={totalCartCount}
        totalCartAmount={totalCartAmount}
        onOpenCart={() => setIsCartOpen(true)}
        whatsappNumber={store.whatsappNumber}
      />

      {/* 3. Hero Section */}
      <HeroSection />

      {/* 4. Packages Section */}
      <section id="paket" className="py-12 md:py-16 px-4 sm:px-6 bg-[#EFECE3]/70 border-y border-[#E2DDD2]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#16253D] tracking-tight font-display">
                Paket
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5E7A] max-w-sm font-semibold">
              Semua paket sudah termasuk Creamy Ranch Sauce. Bebas pilih varian rasa!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                packageItem={pkg}
                onSelect={(p) => setCustomizerItem({ item: p, type: "PACKAGE" })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Main Catalog Menu Section */}
      <section id="menu" className="py-12 md:py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full flex-1">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#16253D] tracking-tight font-display">
            Menu Cireng
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5E7A] mt-2 font-medium">
            Pilihan menu: Ayam Rica, Sapi Teriyaki, Paru Rica, Pizza, dan Keju.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {[
            { id: "ALL", label: "Semua Menu" },
            { id: "PACKAGES", label: "Paket" },
            { id: "PRODUCTS", label: "Menu Cireng" },
            { id: "ADDONS", label: "Saus" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? "bg-[#16253D] text-white shadow-md border border-[#2C3E5A]"
                  : "bg-white text-[#4B5E7A] border border-[#E2DDD2] hover:border-[#CFC8B8] hover:text-[#16253D]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeCategory === "ALL" || activeCategory === "PRODUCTS") &&
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setCustomizerItem({ item: p, type: "PRODUCT" })}
              />
            ))}

          {(activeCategory === "ALL" || activeCategory === "PACKAGES") &&
            packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                packageItem={pkg}
                onSelect={(p) => setCustomizerItem({ item: p, type: "PACKAGE" })}
              />
            ))}
        </div>
      </section>

      {/* 6. Sauces & Add-ons Showcase */}
      <section id="sauce" className="py-12 px-4 sm:px-6 bg-[#F4EFE6]/70 border-t border-[#E2DDD2]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#16253D] tracking-tight font-display">
                Saus
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5E7A] font-medium">
              Pilihan saus: Creamy Ranch, Taichan, Keju, dan Kuah Rujak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {addons.map((addon) => (
              <div
                key={addon.id}
                className="bg-white p-4 rounded-2xl border border-[#E2DDD2] shadow-2xs flex items-center justify-between"
              >
                <div>
                  <h3 className="font-black text-sm text-[#16253D] mb-0.5">
                    {addon.name}
                  </h3>
                  <p className="text-[11px] text-[#4B5E7A] line-clamp-1 mb-1 font-medium">
                    {addon.description}
                  </p>
                  <span className="text-xs font-black text-[#7D5836]">
                    {formatRupiah(addon.price)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#EBF1F8] flex items-center justify-center text-sm shadow-2xs">
                  🥣
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Floating Mobile Cart Bottom Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#16253D] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between font-black text-sm active:scale-95 transition-all border border-[#2C3E5A]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#D83A2E] text-white rounded-lg flex items-center justify-center text-xs font-black">
                {totalCartCount}
              </div>
              <span>Lihat Keranjang</span>
            </div>
            <span className="text-[#EAA623] font-black">
              {formatRupiah(totalCartAmount)} ➔
            </span>
          </button>
        </div>
      )}

      {/* 8. Modals */}
      <ProductCustomizerModal
        isOpen={Boolean(customizerItem)}
        onClose={() => setCustomizerItem(null)}
        item={customizerItem?.item || null}
        itemType={customizerItem?.type || "PRODUCT"}
        availableAddons={addons}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        paymentSettings={payment}
        onSuccessOrder={handleClearCart}
      />

      {/* 9. Store Footer */}
      <StoreFooter store={store} operational={operational} />
    </div>
  );
}
