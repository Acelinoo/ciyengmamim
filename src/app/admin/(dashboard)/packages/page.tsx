import { db } from "@/lib/db";
import { INITIAL_PACKAGES } from "@/lib/mock-data";
import { PackagesManagerClient } from "./PackagesManagerClient";
import { PackageItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  let packages: PackageItem[] = [];

  try {
    const dbPackages = await db.package.findMany({
      orderBy: { sortOrder: "asc" },
    });
    if (dbPackages.length > 0) {
      packages = dbPackages as unknown as PackageItem[];
    } else {
      packages = INITIAL_PACKAGES;
    }
  } catch {
    packages = INITIAL_PACKAGES;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1E1D1A]">Kelola Paket Bundling</h1>
        <p className="text-xs sm:text-sm text-[#6B685F] mt-1">
          Tambah dan kelola paket hemat bundling, daftar isi item, dan saus yang termasuk.
        </p>
      </div>

      <PackagesManagerClient initialPackages={packages} />
    </div>
  );
}
