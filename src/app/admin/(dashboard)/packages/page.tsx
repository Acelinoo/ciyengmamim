import { getPublicStoreData } from "@/lib/store-data";
import { PackagesManagerClient } from "./PackagesManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  const data = await getPublicStoreData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#16253D] font-display">Kelola Paket Bundling</h1>
        <p className="text-xs sm:text-sm text-[#4B5E7A] mt-1">
          Tambah dan kelola paket hemat bundling, upload foto dari galeri, daftar isi item, dan saus bawaan.
        </p>
      </div>

      <PackagesManagerClient initialPackages={data.packages} />
    </div>
  );
}
