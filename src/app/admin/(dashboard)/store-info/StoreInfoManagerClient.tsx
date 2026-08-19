"use client";

import { useState, useTransition } from "react";
import { StoreSettingsType } from "@/types";
import { updateStoreSettingsAction } from "@/app/actions/admin";
import { Save, Loader2, AlertCircle, CheckCircle2, Store, MessageCircle, MapPin } from "lucide-react";

export function StoreInfoManagerClient({
  initialStore,
}: {
  initialStore: StoreSettingsType;
}) {
  const [storeName, setStoreName] = useState(initialStore.storeName);
  const [tagline, setTagline] = useState(initialStore.tagline || "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialStore.whatsappNumber);
  const [instagramHandle, setInstagramHandle] = useState(initialStore.instagramHandle || "");
  const [instagramUrl, setInstagramUrl] = useState(initialStore.instagramUrl || "");
  const [address, setAddress] = useState(initialStore.address || "");
  const [mapsUrl, setMapsUrl] = useState(initialStore.mapsUrl || "");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const payload = {
      storeName: storeName.trim(),
      tagline: tagline.trim() || null,
      whatsappNumber: whatsappNumber.trim(),
      instagramHandle: instagramHandle.trim() || null,
      instagramUrl: instagramUrl.trim() || null,
      address: address.trim() || null,
      mapsUrl: mapsUrl.trim() || null,
    };

    startTransition(async () => {
      const res = await updateStoreSettingsAction(payload);
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Informasi profil toko berhasil disimpan!",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Gagal memperbarui profil toko.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-[#EBF7EE] text-[#1E562A] border border-[#D4EED8]"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. General Info */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEBE0] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EFEBE0]">
          <Store className="w-5 h-5 text-[#E23E28]" />
          <h2 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
            Identitas Toko
          </h2>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#525048] mb-1">
            Nama Toko *
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#525048] mb-1">
            Tagline / Slogan Toko
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
          />
        </div>
      </div>

      {/* 2. Contact & WhatsApp */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEBE0] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EFEBE0]">
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
          <h2 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
            Kontak WhatsApp Tujuan Pemesanan
          </h2>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#525048] mb-1">
            Nomor WhatsApp Penerima Order (Format: 6281234567890) *
          </label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="6281234567890"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
            required
          />
          <span className="text-[11px] text-[#8A8679] mt-1 block">
            Semua pesanan otomatis diarahkan ke nomor WhatsApp ini saat customer checkout.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#525048] mb-1 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 fill-[#E1306C]" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Username Instagram</span>
            </label>
            <input
              type="text"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="ciyengmamim"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#525048] mb-1">
              Link Profil Instagram
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/ciyengmamim"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
            />
          </div>
        </div>
      </div>

      {/* 3. Address & Maps */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEBE0] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EFEBE0]">
          <MapPin className="w-5 h-5 text-[#E23E28]" />
          <h2 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
            Lokasi & Alamat Fisik
          </h2>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#525048] mb-1">
            Alamat Lengkap Toko
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#525048] mb-1">
            Tautan Google Maps
          </label>
          <input
            type="url"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3.5 bg-[#1E1D1A] hover:bg-[#33312B] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan Profil...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Profil Toko</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
