import { db } from "@/lib/db";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";
import { MenuManagerClient } from "./MenuManagerClient";
import { ProductItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  let products: ProductItem[] = [];

  try {
    const dbProducts = await db.product.findMany({
      orderBy: { sortOrder: "asc" },
      include: { variants: true },
    });
    if (dbProducts.length > 0) {
      products = dbProducts as unknown as ProductItem[];
    } else {
      products = INITIAL_PRODUCTS;
    }
  } catch {
    products = INITIAL_PRODUCTS;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1E1D1A]">Kelola Menu Cireng</h1>
        <p className="text-xs sm:text-sm text-[#6B685F] mt-1">
          Tambah, ubah harga, atur varian rasa, atau update ketersediaan stok cireng.
        </p>
      </div>

      <MenuManagerClient initialProducts={products} />
    </div>
  );
}
