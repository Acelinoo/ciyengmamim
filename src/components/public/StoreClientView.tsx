"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
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
import { StoreFooter } from "./StoreFooter";
import { GoogleReviews } from "./GoogleReviews";
import { formatRupiah } from "@/lib/whatsapp";

import { ProductCustomizerModal } from "./ProductCustomizerModal";
import { CartDrawer } from "./CartDrawer";
import { CheckoutModal } from "./CheckoutModal";

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

  const [activeCategory, setActiveCategory] = useState<
    "ALL" | "PACKAGES" | "PRODUCTS" | "MENTAH" | "ADDONS"
  >("ALL");

  // GSAP Animation Refs
  const paketSectionRef = useRef<HTMLElement>(null);
  const paketHeaderRef = useRef<HTMLDivElement>(null);
  const paketGridRef = useRef<HTMLDivElement>(null);

  const menuSectionRef = useRef<HTMLElement>(null);
  const menuHeaderRef = useRef<HTMLDivElement>(null);
  const menuTabsRef = useRef<HTMLDivElement>(null);
  const menuGridRef = useRef<HTMLDivElement>(null);

  const sauceSectionRef = useRef<HTMLElement>(null);
  const sauceHeaderRef = useRef<HTMLDivElement>(null);
  const sauceGridRef = useRef<HTMLDivElement>(null);

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

  // 1. GSAP Scroll Animations for Sections (Smooth & Lightweight)
  useEffect(() => {
    const setupObserver = (
      sectionEl: HTMLElement | null,
      animateFn: () => void
    ) => {
      if (!sectionEl) return () => {};
      let hasTriggered = false;
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && !hasTriggered) {
            hasTriggered = true;
            observer.disconnect();
            animateFn();
          }
        },
        { threshold: 0.12 }
      );
      observer.observe(sectionEl);
      return () => observer.disconnect();
    };

    // Animate Paket Section
    const cleanupPaket = setupObserver(paketSectionRef.current, () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        if (paketHeaderRef.current) {
          tl.fromTo(
            paketHeaderRef.current,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 }
          );
        }
        if (paketGridRef.current) {
          const cards = paketGridRef.current.children;
          tl.fromTo(
            cards,
            { y: 28, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08 },
            "-=0.3"
          );
        }
      }, paketSectionRef);
      return () => ctx.revert();
    });

    // Animate Menu Section
    const cleanupMenu = setupObserver(menuSectionRef.current, () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        if (menuHeaderRef.current) {
          tl.fromTo(
            menuHeaderRef.current,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 }
          );
        }
        if (menuTabsRef.current) {
          tl.fromTo(
            menuTabsRef.current,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            "-=0.3"
          );
        }
        if (menuGridRef.current) {
          const cards = menuGridRef.current.children;
          tl.fromTo(
            cards,
            { y: 28, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.06 },
            "-=0.3"
          );
        }
      }, menuSectionRef);
      return () => ctx.revert();
    });

    // Animate Sauce Section
    const cleanupSauce = setupObserver(sauceSectionRef.current, () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        if (sauceHeaderRef.current) {
          tl.fromTo(
            sauceHeaderRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 }
          );
        }
        if (sauceGridRef.current) {
          const cards = sauceGridRef.current.children;
          tl.fromTo(
            cards,
            { y: 20, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.06 },
            "-=0.3"
          );
        }
      }, sauceSectionRef);
      return () => ctx.revert();
    });

    return () => {
      cleanupPaket();
      cleanupMenu();
      cleanupSauce();
    };
  }, []);

  // 2. Smooth GSAP Transition when Category Filter Tab Changes
  useEffect(() => {
    if (menuGridRef.current) {
      const cards = menuGridRef.current.children;
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 14, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.04, ease: "power2.out" }
        );
      }
    }
  }, [activeCategory]);

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
      <section
        ref={paketSectionRef}
        id="paket"
        className="py-12 md:py-16 px-4 sm:px-6 bg-[#EFECE3]/70 border-y border-[#E2DDD2]"
      >
        <div className="max-w-6xl mx-auto">
          <div ref={paketHeaderRef} className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#16253D] tracking-tight font-display">
                Paket
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#2C3E5A] max-w-sm font-semibold">
              Semua paket sudah termasuk Creamy Ranch Sauce. Bebas pilih varian rasa!
            </p>
          </div>

          <div ref={paketGridRef} className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
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
      <section
        ref={menuSectionRef}
        id="menu"
        className="py-12 md:py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full flex-1"
      >
        <div ref={menuHeaderRef} className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#16253D] tracking-tight font-display">
            Menu Cireng
          </h2>
          <p className="text-xs sm:text-sm text-[#2C3E5A] mt-2 font-medium">
            Tersedia menu siap santap & versi mentahan siap goreng isi 10 pcs per pack.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div ref={menuTabsRef} className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {[
            { id: "ALL", label: "Semua Menu" },
            { id: "PACKAGES", label: "Paket" },
            { id: "PRODUCTS", label: "Menu Cireng" },
            { id: "MENTAH", label: "🥟 Cireng Mentah (10 Pcs)" },
            { id: "ADDONS", label: "Saus" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id as typeof activeCategory);
                if (tab.id === "ADDONS") {
                  document.getElementById("sauce")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              aria-label={`Filter kategori ${tab.label}`}
              className={`px-5 py-2.5 min-h-[44px] rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? "bg-[#16253D] text-white shadow-md border border-[#2C3E5A]"
                  : "bg-white text-[#2C3E5A] border border-[#E2DDD2] hover:border-[#CFC8B8] hover:text-[#16253D]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid (2 columns on mobile) */}
        <div ref={menuGridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Cireng Matang / Siap Santap */}
          {(activeCategory === "ALL" || activeCategory === "PRODUCTS") &&
            products
              .filter((product) => !product.name.toLowerCase().includes("mentah"))
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setCustomizerItem({ item: p, type: "PRODUCT" })}
                />
              ))}

          {/* Cireng Mentah Isi 10 Pcs Siap Goreng */}
          {(activeCategory === "ALL" || activeCategory === "MENTAH") &&
            products
              .filter((product) => product.name.toLowerCase().includes("mentah"))
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setCustomizerItem({ item: p, type: "PRODUCT" })}
                />
              ))}

          {/* Paket Cireng */}
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

      {/* 6. Sauces & Add-ons Showcase (2 columns on mobile) */}
      <section
        ref={sauceSectionRef}
        id="sauce"
        className="py-12 px-4 sm:px-6 bg-[#F4EFE6]/70 border-t border-[#E2DDD2]"
      >
        <div className="max-w-6xl mx-auto">
          <div ref={sauceHeaderRef} className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#16253D] tracking-tight font-display">
                Saus
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#2C3E5A] font-medium">
              Pilihan saus: Creamy Ranch, Taichan, Keju, dan Kuah Rujak.
            </p>
          </div>

          <div ref={sauceGridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {addons.map((addon) => (
              <div
                key={addon.id}
                className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E2DDD2] shadow-2xs flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform"
              >
                <div className="min-w-0">
                  <h3 className="font-black text-xs sm:text-sm text-[#16253D] mb-0.5 truncate">
                    {addon.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#2C3E5A] line-clamp-1 mb-1 font-medium">
                    {addon.description}
                  </p>
                  <span className="text-xs font-black text-[#5C4028]">
                    {formatRupiah(addon.price)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#EBF1F8] flex items-center justify-center text-sm shadow-2xs shrink-0">
                  🥣
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Google Customer Reviews Section */}
      <GoogleReviews />

      {/* 8. Floating Mobile Cart Bottom Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label={`Lihat Keranjang Belanja ${totalCartCount} porsi, total ${formatRupiah(totalCartAmount)}`}
            className="w-full bg-[#16253D] text-white p-4 min-h-[52px] rounded-2xl shadow-2xl flex items-center justify-between font-black text-sm active:scale-95 transition-all border border-[#2C3E5A]"
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

      {/* 8. Modals (Loaded dynamically) */}
      {Boolean(customizerItem) && (
        <ProductCustomizerModal
          isOpen={Boolean(customizerItem)}
          onClose={() => setCustomizerItem(null)}
          item={customizerItem?.item || null}
          itemType={customizerItem?.type || "PRODUCT"}
          availableAddons={addons}
          onAddToCart={handleAddToCart}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onProceedCheckout={() => setIsCheckoutOpen(true)}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cart}
          paymentSettings={payment}
          onSuccessOrder={handleClearCart}
        />
      )}

      {/* 9. Store Footer */}
      <StoreFooter store={store} operational={operational} />
    </div>
  );
}
