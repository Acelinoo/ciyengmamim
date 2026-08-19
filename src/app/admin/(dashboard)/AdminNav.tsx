"use client";

import { usePathname, useRouter } from "next/navigation";
import { AdminSessionUser } from "@/types";
import { adminLogoutAction } from "@/app/actions/auth";
import {
  Utensils,
  Package,
  Soup,
  CreditCard,
  Clock,
  Store,
  KeyRound,
  LogOut,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AdminNavProps {
  user: AdminSessionUser;
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Menu Cireng", href: "/admin/menu", icon: Utensils },
    { label: "Paket Bundling", href: "/admin/packages", icon: Package },
    { label: "Add-on & Saus", href: "/admin/addons", icon: Soup },
    { label: "Pembayaran", href: "/admin/payment", icon: CreditCard },
    { label: "Jam Operasional", href: "/admin/operations", icon: Clock },
    { label: "Profil Toko", href: "/admin/store-info", icon: Store },
    { label: "Ganti Password", href: "/admin/security", icon: KeyRound },
  ];

  const handleLogout = async () => {
    await adminLogoutAction();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#E2DDD2] p-4 sm:p-5 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header with Logo */}
        <div className="flex items-center justify-between pb-5 border-b border-[#E2DDD2] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#16253D] p-0.5 border border-[#2C3E5A] shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo Ciyeng Mamim"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#16253D] block font-display">
                ciyeng mamim
              </span>
              <span className="text-[10px] text-[#877259] font-medium block truncate max-w-[120px]">
                {user.email}
              </span>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="w-8 h-8 rounded-lg bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center transition-colors"
            title="Buka Website Publik"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 overflow-x-auto md:overflow-visible flex md:flex-col pb-2 md:pb-0 gap-1 md:gap-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#16253D] text-white shadow-sm border border-[#2C3E5A]"
                    : "text-[#4B5E7A] hover:bg-[#F6F3EC] hover:text-[#16253D]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-[#E2DDD2] hidden md:block">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
