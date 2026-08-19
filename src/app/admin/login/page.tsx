"use client";

import { useState, useTransition } from "react";
import { adminLoginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await adminLoginAction({ email, password });
      if (!res.success) {
        setError(res.error || "Gagal masuk ke akun admin.");
        return;
      }
      router.push("/admin/menu");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl border border-[#E2DDD2] shadow-xl">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#16253D] p-1 mx-auto mb-3 shadow-sm border border-[#2C3E5A]">
            <Image
              src="/images/logo.png"
              alt="Logo Ciyeng Mamim"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#16253D] tracking-tight font-display">
            ciyeng mamim
          </h1>
          <p className="text-xs text-[#877259] mt-1 font-semibold">
            Admin Panel — Balikin Mood with Good Food ♡
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
              Email Admin
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ciyengmamim.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
                required
              />
              <Mail className="w-4 h-4 text-[#877259] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-[#CFC8B8] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16253D] bg-[#F6F3EC] text-[#16253D]"
                required
              />
              <Lock className="w-4 h-4 text-[#877259] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-[#16253D] hover:bg-[#1D2D44] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 border border-[#2C3E5A]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E2DDD2] flex items-center justify-center gap-1.5 text-[11px] text-[#877259]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
          <span>Dilindungi oleh HttpOnly Secure Session Guard</span>
        </div>
      </div>
    </div>
  );
}
