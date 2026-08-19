import { db } from "@/lib/db";
import { INITIAL_STORE_SETTINGS } from "@/lib/mock-data";
import { StoreInfoManagerClient } from "./StoreInfoManagerClient";
import { StoreSettingsType } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminStoreInfoPage() {
  let store: StoreSettingsType;

  try {
    const dbStore = await db.storeSettings.findFirst();
    store = dbStore || INITIAL_STORE_SETTINGS;
  } catch {
    store = INITIAL_STORE_SETTINGS;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1E1D1A]">Profil & Informasi Toko</h1>
        <p className="text-xs sm:text-sm text-[#6B685F] mt-1">
          Perbarui nama toko, nomor WhatsApp tujuan pesanan, alamat, dan link Google Maps.
        </p>
      </div>

      <StoreInfoManagerClient initialStore={store} />
    </div>
  );
}
