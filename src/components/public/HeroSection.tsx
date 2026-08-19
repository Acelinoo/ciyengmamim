import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-6 pb-14 md:pt-10 md:pb-20 px-4 sm:px-6">
      {/* ========================================================================= */}
      {/* 🍲 ASYMMETRICAL DECORATIVE FOOD IMAGERY (ROUNDED CIRCULAR IMAGES)         */}
      {/* ========================================================================= */}

      {/* 1. LEFT IMAGE: CIRENG CRISPY (Lower vertical position, -10deg rotation, rounded circle) */}
      <div
        className="absolute -left-10 sm:-left-12 md:-left-8 lg:-left-6 top-[56%] md:top-[50%] lg:top-[46%] -translate-y-1/2 z-10 pointer-events-none select-none transition-transform duration-500 hover:scale-105"
        style={{
          transform: "rotate(-10deg)",
        }}
        aria-hidden="true"
      >
        <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-76 lg:h-76 aspect-square rounded-full overflow-hidden shadow-2xl border-2 border-white/80 bg-white">
          <Image
            src="/images/cireng-bowl.png"
            alt="Cireng Crispy"
            fill
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 256px, 304px"
            className="object-cover"
          />
        </div>
      </div>

      {/* 2. RIGHT IMAGE: CIRENG KUAH CREAMY (Higher vertical position, +8deg rotation, rounded circle) */}
      <div
        className="absolute -right-8 sm:-right-10 md:-right-6 lg:-right-4 top-[8%] sm:top-[6%] md:top-[5%] lg:top-[3%] z-10 pointer-events-none select-none transition-transform duration-500 hover:scale-105"
        style={{
          transform: "rotate(8deg)",
        }}
        aria-hidden="true"
      >
        <div className="relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-84 lg:h-84 aspect-square rounded-full overflow-hidden shadow-2xl border-2 border-white/80 bg-white">
          <Image
            src="/images/cireng-kuah.jpg"
            alt="Cireng Kuah Creamy"
            fill
            sizes="(max-width: 640px) 176px, (max-width: 1024px) 288px, 336px"
            className="object-cover scale-110"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 MAIN HERO CONTENT (CENTRAL FOCAL POINT - Z-INDEX 20)                   */}
      {/* ========================================================================= */}
      <div className="relative z-20 max-w-4xl mx-auto text-center">
        {/* Brand Avatar Icon from Gambar 1 */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 rounded-3xl overflow-hidden bg-[#16253D] p-1 shadow-md border-2 border-[#2C3E5A]">
          <Image
            src="/images/logo.png"
            alt="Logo Ciyeng Mamim"
            fill
            sizes="(max-width: 768px) 80px, 96px"
            className="object-contain"
            priority
          />
        </div>

        {/* Big Display Hero Typography */}
        <div className="relative select-none my-2 md:my-3">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#16253D] leading-[0.9] lowercase font-display">
            ciyeng <br />
            <span className="text-[#1D2D44] tracking-tight">mamim</span>
          </h1>
        </div>

        {/* Headline: Cireng Isi Premium Pertama dgn Creamy Ranch Sauce */}
        <div className="my-4">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[#16253D] tracking-tight font-display max-w-2xl mx-auto leading-snug">
            Cireng Isi Premium Pertama dgn{" "}
            <span className="text-[#5C4028] underline decoration-[#EAA623] decoration-wavy decoration-2">
              Creamy Ranch Sauce
            </span>
          </h2>
          <p className="max-w-lg md:max-w-xl mx-auto text-center text-xs sm:text-base text-[#2C3E5A] font-semibold mt-2 leading-relaxed px-2">
            Pilihan menu: <strong className="text-[#B91C1C]">Ayam Rica</strong>,{" "}
            <strong className="text-[#16253D]">Sapi Teriyaki</strong>,{" "}
            <strong className="text-[#5C4028]">Paru Rica</strong>,{" "}
            <strong className="text-[#5C4028]">Pizza</strong>, dan{" "}
            <strong className="text-[#16253D]">Keju</strong>.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mt-6 mb-10 md:mb-14">
          <a
            href="#menu"
            aria-label="Pesan Menu Cireng Sekarang"
            className="w-full sm:w-auto min-h-[48px] px-8 py-4 bg-[#16253D] hover:bg-[#1D2D44] text-white font-black text-sm md:text-base rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg glow-navy border border-[#2C3E5A]"
          >
            <span>Pesan Menu Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#paket"
            aria-label="Lihat Pilihan Paket Hemat Ciyeng Mamim"
            className="w-full sm:w-auto min-h-[48px] px-7 py-4 bg-white border border-[#CFC8B8] text-[#16253D] font-extrabold text-sm md:text-base rounded-full flex items-center justify-center gap-2 hover:bg-[#EFECE3] transition-all shadow-2xs"
          >
            <span>Lihat Paket Hemat</span>
          </a>
        </div>

        {/* Highlight Cards (Content Locked) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
          {/* Card 1: Ayam Rica */}
          <div className="bg-white p-3.5 md:p-4 rounded-3xl border border-[#E2DDD2] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFF1F2] rounded-2xl flex items-center justify-center text-xl md:text-2xl shrink-0 border border-[#FFE4E6]">
              🍗
            </div>
            <div className="overflow-hidden text-left">
              <span className="block font-black text-xs md:text-sm text-[#16253D] truncate">
                Ayam Rica
              </span>
              <span className="text-[11px] md:text-xs text-[#B91C1C] font-extrabold">
                Ayam Suir Pedas Gurih
              </span>
            </div>
          </div>

          {/* Card 2: Sapi Teriyaki */}
          <div className="bg-white p-3.5 md:p-4 rounded-3xl border border-[#E2DDD2] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FEF7E6] rounded-2xl flex items-center justify-center text-xl md:text-2xl shrink-0 border border-[#FDE68A]">
              🥩
            </div>
            <div className="overflow-hidden text-left">
              <span className="block font-black text-xs md:text-sm text-[#16253D] truncate">
                Sapi Teriyaki
              </span>
              <span className="text-[11px] md:text-xs text-[#5C4028] font-extrabold">
                Daging Sapi Pedas Manis
              </span>
            </div>
          </div>

          {/* Card 3: Paru Rica */}
          <div className="bg-white p-3.5 md:p-4 rounded-3xl border border-[#E2DDD2] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EBF1F8] rounded-2xl flex items-center justify-center text-xl md:text-2xl shrink-0 border border-[#D5E2F1]">
              🌶️
            </div>
            <div className="overflow-hidden text-left">
              <span className="block font-black text-xs md:text-sm text-[#16253D] truncate">
                Paru Rica
              </span>
              <span className="text-[11px] md:text-xs text-[#16253D] font-extrabold">
                Daging Paru Pedas Nampol
              </span>
            </div>
          </div>

          {/* Card 4: Creamy Ranch */}
          <div className="bg-white p-3.5 md:p-4 rounded-3xl border border-[#E2DDD2] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F4EFE6] rounded-2xl flex items-center justify-center text-xl md:text-2xl shrink-0 border border-[#E8DFC2]">
              🥣
            </div>
            <div className="overflow-hidden text-left">
              <span className="block font-black text-xs md:text-sm text-[#16253D] truncate">
                Creamy Ranch
              </span>
              <span className="text-[11px] md:text-xs text-[#5C4028] font-extrabold">
                Saus Khas Ciyeng
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
