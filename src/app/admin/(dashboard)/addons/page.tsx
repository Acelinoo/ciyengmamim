import { db } from "@/lib/db";
import { INITIAL_ADDONS } from "@/lib/mock-data";
import { AddonsManagerClient } from "./AddonsManagerClient";
import { AddOnItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminAddonsPage() {
  let addons: AddOnItem[] = [];

  try {
    const dbAddons = await db.addOn.findMany({
      orderBy: { sortOrder: "asc" },
    });
    if (dbAddons.length > 0) {
      addons = dbAddons as unknown as AddOnItem[];
    } else {
      addons = INITIAL_ADDONS;
    }
  } catch {
    addons = INITIAL_ADDONS;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1E1D1A]">Kelola Saus & Add-on</h1>
        <p className="text-xs sm:text-sm text-[#6B685F] mt-1">
          Tambah dan kelola aneka kuah/saus cocolan ekstra beserta harga satuannya.
        </p>
      </div>

      <AddonsManagerClient initialAddons={addons} />
    </div>
  );
}
