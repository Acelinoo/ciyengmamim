"use client";

import { useState, useTransition } from "react";
import { OperationalSettingsType } from "@/types";
import { updateOperationalSettingsAction } from "@/app/actions/admin";
import { Save, Loader2, AlertCircle, CheckCircle2, Clock, Calendar } from "lucide-react";

const ALL_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function OperationsManagerClient({
  initialSettings,
}: {
  initialSettings: OperationalSettingsType;
}) {
  const [isStoreOpen, setIsStoreOpen] = useState(initialSettings.isStoreOpen);
  const [autoSchedule, setAutoSchedule] = useState(initialSettings.autoSchedule);
  const [openTime, setOpenTime] = useState(initialSettings.openTime);
  const [closeTime, setCloseTime] = useState(initialSettings.closeTime);
  const [closedDays, setClosedDays] = useState<string[]>(initialSettings.closedDays || ["Senin"]);
  const [closedMessage, setClosedMessage] = useState(
    initialSettings.closedMessage || "Toko sedang tutup. Kami kembali melayani di jam operasional."
  );

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleDayToggle = (day: string) => {
    if (closedDays.includes(day)) {
      setClosedDays(closedDays.filter((d) => d !== day));
    } else {
      setClosedDays([...closedDays, day]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const payload = {
      isStoreOpen,
      autoSchedule,
      openTime,
      closeTime,
      closedDays,
      closedMessage: closedMessage.trim(),
    };

    startTransition(async () => {
      const res = await updateOperationalSettingsAction(payload);
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Pengaturan operasional berhasil disimpan!",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Gagal memperbarui jam operasional.",
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

      {/* 1. Master Override Switch */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEBE0] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
              Master Status Toko (Override)
            </h2>
            <p className="text-xs text-[#6B685F] mt-0.5">
              Gunakan saklar ini untuk membuka atau menutup toko secara langsung kapan saja.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            className={`px-5 py-2.5 rounded-full font-black text-xs sm:text-sm transition-all active:scale-95 ${
              isStoreOpen
                ? "bg-[#EBF7EE] text-[#1E562A] border border-[#D4EED8] hover:bg-[#D4EED8]"
                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            }`}
          >
            {isStoreOpen ? "🟢 TOKO BUKA" : "🔴 TOKO TUTUP"}
          </button>
        </div>
      </div>

      {/* 2. Schedule Config */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEBE0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE0]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E23E28]" />
            <h2 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
              Jadwal & Jam Operasional Harian
            </h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#525048]">
            <input
              type="checkbox"
              checked={autoSchedule}
              onChange={(e) => setAutoSchedule(e.target.checked)}
              className="rounded text-[#E23E28] focus:ring-[#E23E28]"
            />
            <span>Hitung Otomatis Berdasarkan Jam</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#525048] mb-1">
              Jam Buka (WIB) *
            </label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#525048] mb-1">
              Jam Tutup (WIB) *
            </label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
              required
            />
          </div>
        </div>

        {/* Closed Days Picker */}
        <div>
          <label className="block text-xs font-bold text-[#525048] mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#8A8679]" />
            <span>Pilih Hari Libur Rutin Toko:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map((day) => {
              const isClosed = closedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isClosed
                      ? "bg-red-100 text-red-800 border border-red-300 font-extrabold"
                      : "bg-[#FAF7EE] text-[#525048] border border-[#EFEBE0] hover:border-[#D9D2C1]"
                  }`}
                >
                  {isClosed ? `🔴 ${day} (Libur)` : day}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#525048] mb-1">
            Pesan Khusus saat Toko Tutup
          </label>
          <textarea
            value={closedMessage}
            onChange={(e) => setClosedMessage(e.target.value)}
            rows={2}
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
              <span>Menyimpan Jam Operasional...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Operasional</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
