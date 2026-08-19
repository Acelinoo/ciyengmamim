import { db } from "@/lib/db";
import { INITIAL_OPERATIONAL_SETTINGS } from "@/lib/mock-data";
import { OperationsManagerClient } from "./OperationsManagerClient";
import { OperationalSettingsType } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOperationsPage() {
  let operational: OperationalSettingsType;

  try {
    const dbOp = await db.operationalSettings.findFirst();
    operational = dbOp || INITIAL_OPERATIONAL_SETTINGS;
  } catch {
    operational = INITIAL_OPERATIONAL_SETTINGS;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1E1D1A]">Pengaturan Jam Operasional</h1>
        <p className="text-xs sm:text-sm text-[#6B685F] mt-1">
          Atur status buka/tutup toko, jadwal hari libur, dan jam operasional harian.
        </p>
      </div>

      <OperationsManagerClient initialSettings={operational} />
    </div>
  );
}
