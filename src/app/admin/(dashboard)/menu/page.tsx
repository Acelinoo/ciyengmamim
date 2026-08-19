import { getPublicStoreData } from "@/lib/store-data";
import { MenuManagerClient } from "./MenuManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const data = await getPublicStoreData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#16253D] font-display">Kelola Menu Cireng</h1>
        <p className="text-xs sm:text-sm text-[#4B5E7A] mt-1">
          Tambah, ubah harga, upload foto dari galeri, atur varian rasa, atau update ketersediaan stok cireng.
        </p>
      </div>

      <MenuManagerClient initialProducts={data.products} />
    </div>
  );
}
