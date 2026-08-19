"use client";

import { useState, useTransition } from "react";
import { changeAdminPasswordAction } from "@/app/actions/auth";
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";

export function SecurityManagerClient() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage("Harap masukkan kata sandi lama Anda.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Kata sandi baru minimal harus 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    startTransition(async () => {
      const result = await changeAdminPasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Gagal mengubah kata sandi.");
        return;
      }

      setSuccessMessage("Kata sandi admin berhasil diubah! Silakan gunakan kata sandi baru untuk login berikutnya.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    });
  };

  return (
    <div className="max-w-2xl bg-white rounded-3xl border border-[#E2DDD2] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-[#E2DDD2]">
        <div className="w-12 h-12 rounded-2xl bg-[#16253D] text-white flex items-center justify-center shadow-sm">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[#16253D] font-display">
            Ubah Kata Sandi Admin
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5E7A]">
            Amankan akses dashboard toko Anda dengan memperbarui kata sandi secara berkala.
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-bold text-[#4B5E7A] mb-1.5">
            Kata Sandi Lama <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan kata sandi saat ini"
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#877259] hover:text-[#16253D]"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-bold text-[#4B5E7A] mb-1.5">
            Kata Sandi Baru <span className="text-red-500">*</span> (Minimal 8 karakter)
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan kata sandi baru"
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#877259] hover:text-[#16253D]"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-[#4B5E7A] mb-1.5">
            Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi baru"
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#877259] hover:text-[#16253D]"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="p-3.5 bg-[#F6F3EC] rounded-xl border border-[#E2DDD2] flex items-center gap-2.5 text-xs text-[#4B5E7A]">
          <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
          <span>Kata sandi dienkripsi menggunakan standar industri bcrypt/argon2 yang aman.</span>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#16253D] hover:bg-[#1D2D44] text-white font-black text-xs sm:text-sm rounded-full shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 border border-[#2C3E5A]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Kata Sandi Baru...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Simpan Perubahan Kata Sandi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
