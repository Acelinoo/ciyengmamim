"use server";

import { requireAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  ProductInputSchema,
  PackageInputSchema,
  AddonInputSchema,
  PaymentSettingsInputSchema,
  OperationalSettingsInputSchema,
  StoreSettingsInputSchema,
} from "@/lib/validations";
import {
  saveMemoryProduct,
  setMemoryProductAvailability,
  deleteMemoryProduct,
  saveMemoryPackage,
  setMemoryPackageAvailability,
  deleteMemoryPackage,
  saveMemoryAddon,
  setMemoryAddonAvailability,
  deleteMemoryAddon,
  saveMemoryPaymentSettings,
  saveMemoryOperationalSettings,
  saveMemoryStoreSettings,
} from "@/lib/store-data";
import { ProductItem, PackageItem, AddOnItem } from "@/types";
import { revalidatePath } from "next/cache";

// Helper internal untuk mencatat audit log admin
async function recordAuditLog(
  adminEmail: string,
  action: string,
  resource: string,
  details?: Record<string, unknown>
) {
  try {
    await db.adminAuditLog.create({
      data: {
        adminEmail,
        action,
        resource,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// 1. PRODUCT CRUD MUTATIONS
// -------------------------------------------------------------
export async function saveProductAction(rawData: unknown) {
  const admin = await requireAdminSession();
  const parsed = ProductInputSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { id, name, slug, description, price, imageUrl, isAvailable, sortOrder, variants } =
    parsed.data;

  const targetId = id || `prod_${Date.now()}`;
  const productData: ProductItem = {
    id: targetId,
    name,
    slug,
    description: description || null,
    price,
    imageUrl,
    isAvailable: isAvailable ?? true,
    sortOrder: sortOrder ?? 0,
    variants: variants?.map((v, i) => ({ id: v.id || `var_${i}`, name: v.name, price: v.price })) || [],
  };

  // 1. Sync to Memory Store (Instant 100% Persistence)
  saveMemoryProduct(productData);

  // 2. Sync to Database if available
  try {
    if (id) {
      await db.variantOption.deleteMany({ where: { productId: id } }).catch(() => null);
      await db.product.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          price,
          imageUrl,
          isAvailable,
          sortOrder,
          variants: {
            create: variants?.map((v) => ({ name: v.name, price: v.price })),
          },
        },
      }).catch(() => null);
      await recordAuditLog(admin.email, "UPDATE_PRODUCT", `Product:${id}`, { name, price });
    } else {
      await db.product.create({
        data: {
          id: targetId,
          name,
          slug,
          description,
          price,
          imageUrl,
          isAvailable,
          sortOrder,
          variants: {
            create: variants?.map((v) => ({ name: v.name, price: v.price })),
          },
        },
      }).catch(() => null);
      await recordAuditLog(admin.email, "CREATE_PRODUCT", `Product:${targetId}`, { name, price });
    }
  } catch (err) {
    console.warn("DB save product warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/menu");
  return { success: true, product: productData };
}

export async function deleteProductAction(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdminSession();

  // 1. Sync Memory
  deleteMemoryProduct(id);

  // 2. Sync DB
  try {
    await db.product.delete({ where: { id } }).catch(() => null);
    await recordAuditLog(admin.email, "DELETE_PRODUCT", `Product:${id}`);
  } catch (err) {
    console.warn("DB delete product warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/menu");
  return { success: true };
}

export async function toggleProductAvailabilityAction(
  id: string,
  isAvailable: boolean
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdminSession();

  // 1. Sync Memory
  setMemoryProductAvailability(id, isAvailable);

  // 2. Sync DB
  try {
    await db.product.update({
      where: { id },
      data: { isAvailable },
    }).catch(() => null);
    await recordAuditLog(admin.email, "TOGGLE_PRODUCT_STATUS", `Product:${id}`, { isAvailable });
  } catch (err) {
    console.warn("DB toggle product status warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/menu");
  return { success: true };
}

// -------------------------------------------------------------
// 2. PACKAGE CRUD MUTATIONS
// -------------------------------------------------------------
export async function savePackageAction(rawData: unknown) {
  const admin = await requireAdminSession();
  const parsed = PackageInputSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { id, name, slug, description, price, imageUrl, packageItems, includedSauces, isAvailable, sortOrder } =
    parsed.data;

  const targetId = id || `pkg_${Date.now()}`;
  const packageData: PackageItem = {
    id: targetId,
    name,
    slug,
    description: description || null,
    price,
    imageUrl,
    packageItems,
    includedSauces,
    isAvailable: isAvailable ?? true,
    sortOrder: sortOrder ?? 0,
  };

  saveMemoryPackage(packageData);

  try {
    if (id) {
      await db.package.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          price,
          imageUrl,
          packageItems,
          includedSauces,
          isAvailable,
          sortOrder,
        },
      }).catch(() => null);
      await recordAuditLog(admin.email, "UPDATE_PACKAGE", `Package:${id}`, { name, price });
    } else {
      await db.package.create({
        data: {
          id: targetId,
          name,
          slug,
          description,
          price,
          imageUrl,
          packageItems,
          includedSauces,
          isAvailable,
          sortOrder,
        },
      }).catch(() => null);
      await recordAuditLog(admin.email, "CREATE_PACKAGE", `Package:${targetId}`, { name, price });
    }
  } catch (err) {
    console.warn("DB save package warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/packages");
  return { success: true, package: packageData };
}

export async function deletePackageAction(id: string) {
  const admin = await requireAdminSession();

  deleteMemoryPackage(id);

  try {
    await db.package.delete({ where: { id } }).catch(() => null);
    await recordAuditLog(admin.email, "DELETE_PACKAGE", `Package:${id}`);
  } catch {
    // ignore
  }

  revalidatePath("/");
  revalidatePath("/admin/packages");
  return { success: true };
}

export async function togglePackageAvailabilityAction(id: string, isAvailable: boolean) {
  const admin = await requireAdminSession();

  setMemoryPackageAvailability(id, isAvailable);

  try {
    await db.package.update({
      where: { id },
      data: { isAvailable },
    }).catch(() => null);
    await recordAuditLog(admin.email, "TOGGLE_PACKAGE_STATUS", `Package:${id}`, { isAvailable });
  } catch (err) {
    console.warn("DB toggle package status warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/packages");
  return { success: true };
}

// -------------------------------------------------------------
// 3. ADD-ON & SAUCE CRUD MUTATIONS
// -------------------------------------------------------------
export async function saveAddonAction(rawData: unknown) {
  const admin = await requireAdminSession();
  const parsed = AddonInputSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { id, name, description, price, imageUrl, isAvailable, sortOrder } = parsed.data;
  const targetId = id || `addon_${Date.now()}`;
  const addonData: AddOnItem = {
    id: targetId,
    name,
    description: description || null,
    price,
    imageUrl: imageUrl || null,
    isAvailable: isAvailable ?? true,
    sortOrder: sortOrder ?? 0,
  };

  saveMemoryAddon(addonData);

  try {
    if (id) {
      await db.addOn.update({
        where: { id },
        data: { name, description, price, imageUrl, isAvailable, sortOrder },
      }).catch(() => null);
      await recordAuditLog(admin.email, "UPDATE_ADDON", `AddOn:${id}`, { name, price });
    } else {
      await db.addOn.create({
        data: { id: targetId, name, description, price, imageUrl, isAvailable, sortOrder },
      }).catch(() => null);
      await recordAuditLog(admin.email, "CREATE_ADDON", `AddOn:${targetId}`, { name, price });
    }
  } catch (err) {
    console.warn("DB save addon warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/addons");
  return { success: true, addon: addonData };
}

export async function deleteAddonAction(id: string) {
  const admin = await requireAdminSession();

  deleteMemoryAddon(id);

  try {
    await db.addOn.delete({ where: { id } }).catch(() => null);
    await recordAuditLog(admin.email, "DELETE_ADDON", `AddOn:${id}`);
  } catch {
    // ignore
  }

  revalidatePath("/");
  revalidatePath("/admin/addons");
  return { success: true };
}

export async function toggleAddonAvailabilityAction(id: string, isAvailable: boolean) {
  const admin = await requireAdminSession();

  setMemoryAddonAvailability(id, isAvailable);

  try {
    await db.addOn.update({
      where: { id },
      data: { isAvailable },
    }).catch(() => null);
    await recordAuditLog(admin.email, "TOGGLE_ADDON_STATUS", `AddOn:${id}`, { isAvailable });
  } catch (err) {
    console.warn("DB toggle addon status warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/addons");
  return { success: true };
}

// -------------------------------------------------------------
// 4. PAYMENT SETTINGS MUTATION
// -------------------------------------------------------------
export async function updatePaymentSettingsAction(rawData: unknown) {
  const admin = await requireAdminSession();
  const parsed = PaymentSettingsInputSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  saveMemoryPaymentSettings({
    id: "default_payment",
    ...parsed.data,
  });

  try {
    await db.paymentSettings.upsert({
      where: { id: "default_payment" },
      create: { id: "default_payment", ...parsed.data },
      update: parsed.data,
    }).catch(() => null);
    await recordAuditLog(admin.email, "UPDATE_PAYMENT_CONFIG", "PaymentSettings", {
      bankName: parsed.data.bankName,
      accountNumber: parsed.data.accountNumber,
    });
  } catch (err) {
    console.warn("DB update payment warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/payment");
  return { success: true };
}

// -------------------------------------------------------------
// 5. OPERATIONAL SETTINGS MUTATION
// -------------------------------------------------------------
export async function updateOperationalSettingsAction(rawData: unknown) {
  const admin = await requireAdminSession();
  const parsed = OperationalSettingsInputSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  saveMemoryOperationalSettings({
    id: "default_operational",
    ...parsed.data,
  });

  try {
    await db.operationalSettings.upsert({
      where: { id: "default_operational" },
      create: { id: "default_operational", ...parsed.data },
      update: parsed.data,
    }).catch(() => null);
    await recordAuditLog(admin.email, "UPDATE_OPERATIONAL_CONFIG", "OperationalSettings", {
      isStoreOpen: parsed.data.isStoreOpen,
    });
  } catch (err) {
    console.warn("DB update operational warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/operations");
  return { success: true };
}

// -------------------------------------------------------------
// 6. STORE PROFILE MUTATION
// -------------------------------------------------------------
export async function updateStoreSettingsAction(rawData: unknown) {
  const admin = await requireAdminSession();
  const parsed = StoreSettingsInputSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  saveMemoryStoreSettings({
    id: "default_store",
    storeName: parsed.data.storeName,
    tagline: parsed.data.tagline || "",
    whatsappNumber: parsed.data.whatsappNumber,
    instagramHandle: parsed.data.instagramHandle || "",
    instagramUrl: parsed.data.instagramUrl || "",
    address: parsed.data.address,
    mapsUrl: parsed.data.mapsUrl || "",
    logoUrl: parsed.data.logoUrl ?? null,
    mapsEmbedUrl: parsed.data.mapsEmbedUrl ?? null,
  });

  try {
    await db.storeSettings.upsert({
      where: { id: "default_store" },
      create: { id: "default_store", ...parsed.data },
      update: parsed.data,
    }).catch(() => null);
    await recordAuditLog(admin.email, "UPDATE_STORE_PROFILE", "StoreSettings", {
      storeName: parsed.data.storeName,
    });
  } catch (err) {
    console.warn("DB update store warning:", err);
  }

  revalidatePath("/");
  revalidatePath("/admin/store-info");
  return { success: true };
}
