"use client";

import { useEffect, useRef } from "react";
import { Star, MessageSquareQuote, ExternalLink } from "lucide-react";
import gsap from "gsap";
import {
  GOOGLE_REVIEWS_WRITE_URL,
  GOOGLE_REVIEWS_SUMMARY,
  INITIAL_CUSTOMER_REVIEWS,
  CustomerReview,
} from "@/lib/reviews-data";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface GoogleReviewsProps {
  reviews?: CustomerReview[];
}

export function GoogleReviews({ reviews = INITIAL_CUSTOMER_REVIEWS }: GoogleReviewsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let hasAnimated = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          observer.disconnect();

          const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            if (headerRef.current) {
              tl.fromTo(
                headerRef.current,
                { y: 24, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7 }
              );
            }

            if (ratingRef.current) {
              tl.fromTo(
                ratingRef.current,
                { y: 24, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.7 },
                "-=0.5"
              );
            }

            if (gridRef.current) {
              const cards = gridRef.current.children;
              tl.fromTo(
                cards,
                { y: 30, opacity: 0, scale: 0.96 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08 },
                "-=0.4"
              );
            }

            if (ctaRef.current) {
              tl.fromTo(
                ctaRef.current,
                { y: 20, opacity: 0, scale: 0.98 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6 },
                "-=0.2"
              );
            }
          }, el);

          return () => ctx.revert();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ulasan"
      className="py-14 md:py-20 px-4 sm:px-6 bg-[#EFECE3]/70 border-t border-[#E2DDD2]"
      aria-label="Ulasan Pelanggan Google Reviews"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* ========================================================================= */}
        {/* 1. SECTION HEADER WITH GOOGLE RATING HIGHLIGHT                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div ref={headerRef} className="space-y-2">
            {/* Google Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E2DDD2] rounded-full shadow-2xs">
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-black text-[#16253D] tracking-wide">
                Google Reviews
              </span>
              <span className="text-[#CFC8B8]">•</span>
              <span className="text-xs font-bold text-[#15803D]">Terverifikasi</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#16253D] tracking-tight font-display">
              Apa Kata Pelanggan?
            </h2>

            {/* Subheading */}
            <p className="text-xs sm:text-base text-[#5C4028] font-bold">
              Ulasan pelanggan Ciyeng Mamim di Google
            </p>
          </div>

          {/* Rating Summary Card */}
          <div
            ref={ratingRef}
            className="bg-white border border-[#E2DDD2] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs flex items-center gap-4 shrink-0"
          >
            <div className="text-center pr-3 border-r border-[#EFECE3]">
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-black text-[#16253D] leading-none">
                  {GOOGLE_REVIEWS_SUMMARY.rating.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-[#877259]">
                  /{GOOGLE_REVIEWS_SUMMARY.maxRating.toFixed(1)}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#5C4028] block mt-1">
                {GOOGLE_REVIEWS_SUMMARY.label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-0.5 text-[#EAA623]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#2C3E5A] block">
                Kepuasan Bintang 5
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. REVIEW CARDS GRID                                                      */}
        {/* ========================================================================= */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#E2DDD2] hover:border-[#16253D] p-5 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col justify-between transition-all group hover:-translate-y-0.5"
            >
              <div className="space-y-3.5">
                {/* Reviewer Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full ${review.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}
                    >
                      {review.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-black text-[#16253D] truncate group-hover:text-[#1D2D44] transition-colors">
                        {review.name}
                      </h3>
                      <span className="text-[10px] text-[#877259] font-medium block">
                        {review.date}
                      </span>
                    </div>
                  </div>

                  <GoogleIcon className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-0.5 text-[#EAA623]">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                {/* Review Content */}
                <p className="text-xs text-[#2C3E5A] leading-relaxed font-medium line-clamp-4">
                  “{review.reviewText}”
                </p>
              </div>

              {/* Menu Mention Pill */}
              {review.favoriteItem && (
                <div className="mt-4 pt-3 border-t border-[#EFECE3]">
                  <span className="text-[10px] font-bold text-[#5C4028] bg-[#F6F3EC] px-2.5 py-1 rounded-full inline-block truncate max-w-full">
                    🍽️ {review.favoriteItem}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 3. CTA: BERIKAN ULASAN GOOGLE (DEEP LINK FORM ULASAN)                     */}
        {/* ========================================================================= */}
        <div
          ref={ctaRef}
          className="bg-white border border-[#E2DDD2] rounded-3xl p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-sm space-y-4"
        >
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#16253D]">
              Punya pengalaman di Ciyeng Mamim?
            </h3>
            <p className="text-xs sm:text-sm text-[#2C3E5A] font-medium leading-relaxed max-w-lg mx-auto">
              Bagikan pengalaman kamu di Google dan bantu pelanggan lain mengenal Ciyeng Mamim.
            </p>
          </div>

          <a
            href={GOOGLE_REVIEWS_WRITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tulis Ulasan di Google Maps untuk Ciyeng Mamim"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] bg-[#16253D] hover:bg-[#1D2D44] text-white rounded-full font-black text-xs sm:text-sm shadow-md glow-navy border border-[#2C3E5A] active:scale-95 transition-all"
          >
            <GoogleIcon className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" />
            <span>Berikan Ulasan di Google</span>
            <ExternalLink className="w-4 h-4 shrink-0 text-[#EAA623]" />
          </a>
        </div>
      </div>
    </section>
  );
}
