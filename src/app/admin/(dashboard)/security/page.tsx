import { SecurityManagerClient } from "./SecurityManagerClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keamanan & Ganti Password — Admin Ciyeng Mamim",
};

export default function AdminSecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#16253D] font-display">Keamanan Akun</h1>
        <p className="text-xs sm:text-sm text-[#4B5E7A] mt-1">
          Kelola kredensial dan kata sandi akun admin toko Ciyeng Mamim.
        </p>
      </div>

      <SecurityManagerClient />
    </div>
  );
}
