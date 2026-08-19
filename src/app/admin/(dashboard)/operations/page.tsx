import { getPublicStoreData } from "@/lib/store-data";
import { OperationsManagerClient } from "./OperationsManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminOperationsPage() {
  const data = await getPublicStoreData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#16253D] font-display">Pengaturan Jam Operasional</h1>
        <p className="text-xs sm:text-sm text-[#4B5E7A] mt-1">
          Atur status buka/tutup toko, jadwal hari libur, dan jam operasional harian.
        </p>
      </div>

      <OperationsManagerClient initialSettings={data.operational} />
    </div>
  );
}
