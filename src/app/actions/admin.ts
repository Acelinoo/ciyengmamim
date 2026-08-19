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
  } catch (err) {
    console.error("Failed to write audit log:", err);
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

  try {
    if (id) {
      // Update existing
      await db.variantOption.deleteMany({ where: { productId: id } });

      const updated = await db.product.update({
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
      });
      await recordAuditLog(admin.email, "UPDATE_PRODUCT", `Product:${id}`, { name, price });
      revalidatePath("/");
      revalidatePath("/admin/menu");
      return { success: true, product: updated };
    } else {
      // Create new
      const created = await db.product.create({
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
      });
      await recordAuditLog(admin.email, "CREATE_PRODUCT", `Product:${created.id}`, { name, price });
      revalidatePath("/");
      revalidatePath("/admin/menu");
      return { success: true, product: created };
    }
  } catch (err) {
    console.error("Save product error:", err);
    return { success: false, error: "Gagal menyimpan produk cireng." };
  }
}

export async function deleteProductAction(id: string) {
  const admin = await requireAdminSession();
  try {
    await db.product.delete({ where: { id } });
    await recordAuditLog(admin.email, "DELETE_PRODUCT", `Product:${id}`);
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus produk." };
  }
}

export async function toggleProductAvailabilityAction(id: string, isAvailable: boolean) {
  const admin = await requireAdminSession();
  try {
    await db.product.update({
      where: { id },
      data: { isAvailable },
    });
    await recordAuditLog(admin.email, "TOGGLE_PRODUCT_STATUS", `Product:${id}`, { isAvailable });
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui status ketersediaan." };
  }
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

  try {
    if (id) {
      const updated = await db.package.update({
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
      });
      await recordAuditLog(admin.email, "UPDATE_PACKAGE", `Package:${id}`, { name, price });
      revalidatePath("/");
      revalidatePath("/admin/packages");
      return { success: true, package: updated };
    } else {
      const created = await db.package.create({
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
      });
      await recordAuditLog(admin.email, "CREATE_PACKAGE", `Package:${created.id}`, { name, price });
      revalidatePath("/");
      revalidatePath("/admin/packages");
      return { success: true, package: created };
    }
  } catch (err) {
    console.error("Save package error:", err);
    return { success: false, error: "Gagal menyimpan paket bundling." };
  }
}

export async function deletePackageAction(id: string) {
  const admin = await requireAdminSession();
  try {
    await db.package.delete({ where: { id } });
    await recordAuditLog(admin.email, "DELETE_PACKAGE", `Package:${id}`);
    revalidatePath("/");
    revalidatePath("/admin/packages");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus paket." };
  }
}

export async function togglePackageAvailabilityAction(id: string, isAvailable: boolean) {
  const admin = await requireAdminSession();
  try {
    await db.package.update({
      where: { id },
      data: { isAvailable },
    });
    await recordAuditLog(admin.email, "TOGGLE_PACKAGE_STATUS", `Package:${id}`, { isAvailable });
    revalidatePath("/");
    revalidatePath("/admin/packages");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengubah status paket." };
  }
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

  try {
    if (id) {
      const updated = await db.addOn.update({
        where: { id },
        data: { name, description, price, imageUrl, isAvailable, sortOrder },
      });
      await recordAuditLog(admin.email, "UPDATE_ADDON", `AddOn:${id}`, { name, price });
      revalidatePath("/");
      revalidatePath("/admin/addons");
      return { success: true, addon: updated };
    } else {
      const created = await db.addOn.create({
        data: { name, description, price, imageUrl, isAvailable, sortOrder },
      });
      await recordAuditLog(admin.email, "CREATE_ADDON", `AddOn:${created.id}`, { name, price });
      revalidatePath("/");
      revalidatePath("/admin/addons");
      return { success: true, addon: created };
    }
  } catch (err) {
    console.error("Save addon error:", err);
    return { success: false, error: "Gagal menyimpan saus add-on." };
  }
}

export async function deleteAddonAction(id: string) {
  const admin = await requireAdminSession();
  try {
    await db.addOn.delete({ where: { id } });
    await recordAuditLog(admin.email, "DELETE_ADDON", `AddOn:${id}`);
    revalidatePath("/");
    revalidatePath("/admin/addons");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus add-on." };
  }
}

export async function toggleAddonAvailabilityAction(id: string, isAvailable: boolean) {
  const admin = await requireAdminSession();
  try {
    await db.addOn.update({
      where: { id },
      data: { isAvailable },
    });
    await recordAuditLog(admin.email, "TOGGLE_ADDON_STATUS", `AddOn:${id}`, { isAvailable });
    revalidatePath("/");
    revalidatePath("/admin/addons");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengubah status saus." };
  }
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

  try {
    const updated = await db.paymentSettings.upsert({
      where: { id: "default_payment" },
      create: { id: "default_payment", ...parsed.data },
      update: parsed.data,
    });
    await recordAuditLog(admin.email, "UPDATE_PAYMENT_CONFIG", "PaymentSettings", {
      bankName: parsed.data.bankName,
      accountNumber: parsed.data.accountNumber,
    });
    revalidatePath("/");
    revalidatePath("/admin/payment");
    return { success: true, payment: updated };
  } catch (err) {
    console.error("Update payment error:", err);
    return { success: false, error: "Gagal memperbarui pengaturan pembayaran." };
  }
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

  try {
    const updated = await db.operationalSettings.upsert({
      where: { id: "default_operational" },
      create: { id: "default_operational", ...parsed.data },
      update: parsed.data,
    });
    await recordAuditLog(admin.email, "UPDATE_OPERATIONAL_CONFIG", "OperationalSettings", {
      isStoreOpen: parsed.data.isStoreOpen,
      openTime: parsed.data.openTime,
      closeTime: parsed.data.closeTime,
    });
    revalidatePath("/");
    revalidatePath("/admin/operations");
    return { success: true, operational: updated };
  } catch (err) {
    console.error("Update operational error:", err);
    return { success: false, error: "Gagal memperbarui jam operasional." };
  }
}

// -------------------------------------------------------------
// 6. STORE SETTINGS MUTATION
// -------------------------------------------------------------
export async function updateStoreSettingsAction(rawData: unknown) {
  const admin = await requireAdminSession();
  const parsed = StoreSettingsInputSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const updated = await db.storeSettings.upsert({
      where: { id: "default_store" },
      create: { id: "default_store", ...parsed.data },
      update: parsed.data,
    });
    await recordAuditLog(admin.email, "UPDATE_STORE_PROFILE", "StoreSettings", {
      storeName: parsed.data.storeName,
      whatsappNumber: parsed.data.whatsappNumber,
    });
    revalidatePath("/");
    revalidatePath("/admin/store-info");
    return { success: true, store: updated };
  } catch (err) {
    console.error("Update store profile error:", err);
    return { success: false, error: "Gagal memperbarui profil toko." };
  }
}
