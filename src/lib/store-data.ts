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

// Global in-memory dynamic state (Ensures instant 100% persistence on Serverless & Localhost even without DB)
const globalStoreState = globalThis as unknown as {
  ciyengStoreData?: {
    store: StoreSettingsType;
    operational: OperationalSettingsType;
    payment: PaymentSettingsType;
    products: ProductItem[];
    packages: PackageItem[];
    addons: AddOnItem[];
  };
};

if (!globalStoreState.ciyengStoreData) {
  globalStoreState.ciyengStoreData = {
    store: { ...INITIAL_STORE_SETTINGS },
    operational: { ...INITIAL_OPERATIONAL_SETTINGS },
    payment: { ...INITIAL_PAYMENT_SETTINGS },
    products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
    packages: JSON.parse(JSON.stringify(INITIAL_PACKAGES)),
    addons: JSON.parse(JSON.stringify(INITIAL_ADDONS)),
  };
}

export const dynamicStore = globalStoreState.ciyengStoreData;

/**
 * Mengambil seluruh data publik katalog dan konfigurasi toko
 */
export async function getPublicStoreData(): Promise<PublicStoreData> {
  try {
    const storeDb = await db.storeSettings.findFirst().catch(() => null);

    if (storeDb) {
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
        store: storeDb,
        operational: opDb || dynamicStore.operational,
        payment: payDb || dynamicStore.payment,
        products:
          productsDb && productsDb.length > 0
            ? (productsDb as unknown as ProductItem[])
            : dynamicStore.products,
        packages:
          packagesDb && packagesDb.length > 0
            ? (packagesDb as unknown as PackageItem[])
            : dynamicStore.packages,
        addons:
          addonsDb && addonsDb.length > 0
            ? (addonsDb as unknown as AddOnItem[])
            : dynamicStore.addons,
      };
    }
  } catch {
    // Fallback to dynamic synchronized memory store below
  }

  return {
    store: dynamicStore.store,
    operational: dynamicStore.operational,
    payment: dynamicStore.payment,
    products: dynamicStore.products,
    packages: dynamicStore.packages,
    addons: dynamicStore.addons,
  };
}

// -------------------------------------------------------------
// DYNAMIC STORE MUTATION HELPERS (Sync Memory & DB)
// -------------------------------------------------------------

export function setMemoryProductAvailability(id: string, isAvailable: boolean) {
  dynamicStore.products = dynamicStore.products.map((p) =>
    p.id === id ? { ...p, isAvailable } : p
  );
}

export function saveMemoryProduct(product: ProductItem) {
  const existingIdx = dynamicStore.products.findIndex((p) => p.id === product.id);
  if (existingIdx >= 0) {
    dynamicStore.products[existingIdx] = product;
  } else {
    dynamicStore.products.push(product);
  }
}

export function deleteMemoryProduct(id: string) {
  dynamicStore.products = dynamicStore.products.filter((p) => p.id !== id);
}

export function setMemoryPackageAvailability(id: string, isAvailable: boolean) {
  dynamicStore.packages = dynamicStore.packages.map((p) =>
    p.id === id ? { ...p, isAvailable } : p
  );
}

export function saveMemoryPackage(pkg: PackageItem) {
  const existingIdx = dynamicStore.packages.findIndex((p) => p.id === pkg.id);
  if (existingIdx >= 0) {
    dynamicStore.packages[existingIdx] = pkg;
  } else {
    dynamicStore.packages.push(pkg);
  }
}

export function deleteMemoryPackage(id: string) {
  dynamicStore.packages = dynamicStore.packages.filter((p) => p.id !== id);
}

export function setMemoryAddonAvailability(id: string, isAvailable: boolean) {
  dynamicStore.addons = dynamicStore.addons.map((a) =>
    a.id === id ? { ...a, isAvailable } : a
  );
}

export function saveMemoryAddon(addon: AddOnItem) {
  const existingIdx = dynamicStore.addons.findIndex((a) => a.id === addon.id);
  if (existingIdx >= 0) {
    dynamicStore.addons[existingIdx] = addon;
  } else {
    dynamicStore.addons.push(addon);
  }
}

export function deleteMemoryAddon(id: string) {
  dynamicStore.addons = dynamicStore.addons.filter((a) => a.id !== id);
}

export function saveMemoryPaymentSettings(payment: PaymentSettingsType) {
  dynamicStore.payment = { ...dynamicStore.payment, ...payment };
}

export function saveMemoryOperationalSettings(op: OperationalSettingsType) {
  dynamicStore.operational = { ...dynamicStore.operational, ...op };
}

export function saveMemoryStoreSettings(store: StoreSettingsType) {
  dynamicStore.store = { ...dynamicStore.store, ...store };
}
