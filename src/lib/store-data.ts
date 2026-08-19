import { db } from "@/lib/db";
import {
  ProductItem,
  PackageItem,
  AddOnItem,
  StoreSettingsType,
  OperationalSettingsType,
  PaymentSettingsType,
} from "@/types";
import {
  INITIAL_STORE_SETTINGS,
  INITIAL_OPERATIONAL_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_PACKAGES,
  INITIAL_ADDONS,
} from "@/lib/mock-data";

export interface PublicStoreData {
  store: StoreSettingsType;
  operational: OperationalSettingsType;
  payment: PaymentSettingsType;
  products: ProductItem[];
  packages: PackageItem[];
  addons: AddOnItem[];
}

/**
 * Mengambil seluruh data publik katalog dan konfigurasi toko
 * Menggunakan fallback yang aman dan cepat jika database belum terhubung
 */
export async function getPublicStoreData(): Promise<PublicStoreData> {
  try {
    const storeDb = await db.storeSettings.findFirst().catch(() => null);

    if (!storeDb) {
      return {
        store: INITIAL_STORE_SETTINGS,
        operational: INITIAL_OPERATIONAL_SETTINGS,
        payment: INITIAL_PAYMENT_SETTINGS,
        products: INITIAL_PRODUCTS,
        packages: INITIAL_PACKAGES,
        addons: INITIAL_ADDONS,
      };
    }

    const [opDb, payDb, productsDb, packagesDb, addonsDb] = await Promise.all([
      db.operationalSettings.findFirst().catch(() => null),
      db.paymentSettings.findFirst().catch(() => null),
      db.product
        .findMany({
          orderBy: { sortOrder: "asc" },
          include: { variants: true },
        })
        .catch(() => []),
      db.package
        .findMany({
          orderBy: { sortOrder: "asc" },
        })
        .catch(() => []),
      db.addOn
        .findMany({
          orderBy: { sortOrder: "asc" },
        })
        .catch(() => []),
    ]);

    return {
      store: storeDb || INITIAL_STORE_SETTINGS,
      operational: opDb || INITIAL_OPERATIONAL_SETTINGS,
      payment: payDb || INITIAL_PAYMENT_SETTINGS,
      products:
        productsDb && productsDb.length > 0
          ? (productsDb as unknown as ProductItem[])
          : INITIAL_PRODUCTS,
      packages:
        packagesDb && packagesDb.length > 0
          ? (packagesDb as unknown as PackageItem[])
          : INITIAL_PACKAGES,
      addons:
        addonsDb && addonsDb.length > 0
          ? (addonsDb as unknown as AddOnItem[])
          : INITIAL_ADDONS,
    };
  } catch {
    return {
      store: INITIAL_STORE_SETTINGS,
      operational: INITIAL_OPERATIONAL_SETTINGS,
      payment: INITIAL_PAYMENT_SETTINGS,
      products: INITIAL_PRODUCTS,
      packages: INITIAL_PACKAGES,
      addons: INITIAL_ADDONS,
    };
  }
}
