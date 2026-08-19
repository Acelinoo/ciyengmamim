import { getPublicStoreData } from "@/lib/store-data";
import { StoreInfoManagerClient } from "./StoreInfoManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminStoreInfoPage() {
  const data = await getPublicStoreData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#16253D] font-display">Profil & Informasi Toko</h1>
        <p className="text-xs sm:text-sm text-[#4B5E7A] mt-1">
          Perbarui nama toko, nomor WhatsApp tujuan pesanan, alamat, dan link Google Maps.
        </p>
      </div>

      <StoreInfoManagerClient initialStore={data.store} />
    </div>
  );
}
