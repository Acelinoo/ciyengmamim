import { getPublicStoreData } from "@/lib/store-data";
import { AddonsManagerClient } from "./AddonsManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminAddonsPage() {
  const data = await getPublicStoreData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#16253D] font-display">Kelola Saus & Add-on</h1>
        <p className="text-xs sm:text-sm text-[#4B5E7A] mt-1">
          Tambah dan kelola aneka kuah/saus cocolan ekstra beserta harga satuannya.
        </p>
      </div>

      <AddonsManagerClient initialAddons={data.addons} />
    </div>
  );
}
