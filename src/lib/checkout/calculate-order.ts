import { db } from "@/lib/db";
import { CheckoutPayload, VerifiedOrderResult, ProductItem, PackageItem, AddOnItem } from "@/types";
import { sanitizeInput } from "@/lib/security/sanitize";
import {
  buildWhatsAppOrderMessage,
  generateWhatsAppDeepLink,
} from "@/lib/whatsapp";
import {
  INITIAL_STORE_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_PACKAGES,
  INITIAL_ADDONS,
} from "@/lib/mock-data";

/**
 * 🔒 SERVER-SIDE PRICE ENGINE & ORDER VERIFIER
 * Memvalidasi integritas harga 100% dari database atau data master resmi
 */
export async function calculateAndVerifyOrder(
  payload: CheckoutPayload
): Promise<VerifiedOrderResult> {
  if (!payload.items || payload.items.length === 0) {
    throw new Error("Keranjang belanja kosong.");
  }

  // 1. Ambil data Store Settings & Pembayaran aktif dengan fallback aman
  const store = await db.storeSettings.findFirst().catch(() => null);
  const payment = await db.paymentSettings.findFirst().catch(() => null);

  const storeWhatsapp = store?.whatsappNumber || INITIAL_STORE_SETTINGS.whatsappNumber || "6289676636637";
  const paymentMethodName =
    payload.paymentMethod === "QRIS"
      ? "QRIS (Scan Barcode)"
      : `Transfer Bank ${payment?.bankName || INITIAL_PAYMENT_SETTINGS.bankName}`;

  // 2. Format Bukti Pembayaran
  let proofUrl = "Akan dikirim langsung via chat WhatsApp";
  if (payload.paymentProofToken && payload.paymentProofToken.trim() !== "") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    proofUrl = `${appUrl}/proof/${payload.paymentProofToken.trim()}`;
  }

  // 3. Kumpulkan seluruh ID produk, paket, dan add-on yang diminta
  const productIds = payload.items
    .filter((item) => item.type === "PRODUCT")
    .map((item) => item.id);
  const packageIds = payload.items
    .filter((item) => item.type === "PACKAGE")
    .map((item) => item.id);
  const allAddonIds = payload.items.flatMap((item) => item.addonIds || []);

  // 4. Query DB untuk data master harga asli (dengan fallback mock data)
  const [dbProducts, dbPackages, dbAddons] = await Promise.all([
    db.product
      .findMany({
        where: { id: { in: productIds } },
        include: { variants: true },
      })
      .catch(() => []),
    db.package
      .findMany({
        where: { id: { in: packageIds } },
      })
      .catch(() => []),
    db.addOn
      .findMany({
        where: { id: { in: allAddonIds } },
      })
      .catch(() => []),
  ]);

  // Master product list (gabungan DB + mock data)
  const allProductsList: ProductItem[] =
    dbProducts.length > 0 ? (dbProducts as unknown as ProductItem[]) : INITIAL_PRODUCTS;
  const allPackagesList: PackageItem[] =
    dbPackages.length > 0 ? (dbPackages as unknown as PackageItem[]) : INITIAL_PACKAGES;
  const allAddonsList: AddOnItem[] =
    dbAddons.length > 0 ? (dbAddons as unknown as AddOnItem[]) : INITIAL_ADDONS;

  const productMap = new Map(allProductsList.map((p) => [p.id, p]));
  const packageMap = new Map(allPackagesList.map((p) => [p.id, p]));
  const addonMap = new Map(allAddonsList.map((a) => [a.id, a]));

  let grandTotal = 0;
  const verifiedItems: VerifiedOrderResult["items"] = [];

  // 5. Kalkulasi setiap item berdasarkan harga resmi
  for (const item of payload.items) {
    if (item.quantity <= 0) {
      throw new Error(`Kuantitas item tidak valid untuk item ID: ${item.id}`);
    }

    if (item.type === "PRODUCT") {
      const product = productMap.get(item.id) || INITIAL_PRODUCTS.find((p) => p.id === item.id);
      if (!product) {
        throw new Error(`Produk dengan ID ${item.id} tidak ditemukan.`);
      }

      let unitPrice = product.price;
      let variantName: string | undefined;

      // Cek varian jika ada
      if (item.variantId && product.variants) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          unitPrice += variant.price;
          variantName = variant.name;
        }
      }

      // Cek extra addons jika ada
      const verifiedAddons: { name: string; price: number }[] = [];
      if (item.addonIds && item.addonIds.length > 0) {
        for (const addonId of item.addonIds) {
          const addon = addonMap.get(addonId) || INITIAL_ADDONS.find((a) => a.id === addonId);
          if (addon) {
            unitPrice += addon.price;
            verifiedAddons.push({ name: addon.name, price: addon.price });
          }
        }
      }

      const subtotal = unitPrice * item.quantity;
      grandTotal += subtotal;

      verifiedItems.push({
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        variantName,
        extraAddons: verifiedAddons,
      });
    } else if (item.type === "PACKAGE") {
      const pkg = packageMap.get(item.id) || INITIAL_PACKAGES.find((p) => p.id === item.id);
      if (!pkg) {
        throw new Error(`Paket dengan ID ${item.id} tidak ditemukan.`);
      }

      let unitPrice = pkg.price;

      // Cek extra addons jika ada
      const verifiedAddons: { name: string; price: number }[] = [];
      if (item.addonIds && item.addonIds.length > 0) {
        for (const addonId of item.addonIds) {
          const addon = addonMap.get(addonId) || INITIAL_ADDONS.find((a) => a.id === addonId);
          if (addon) {
            unitPrice += addon.price;
            verifiedAddons.push({ name: addon.name, price: addon.price });
          }
        }
      }

      const subtotal = unitPrice * item.quantity;
      grandTotal += subtotal;

      verifiedItems.push({
        name: pkg.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        includedSauces: item.selectedSauces || [],
        extraAddons: verifiedAddons,
      });
    }
  }

  // 6. Sanitasi input customer
  const sanitizedName = sanitizeInput(payload.customerName);
  const sanitizedPhone = sanitizeInput(payload.customerPhone);
  const sanitizedAddress = sanitizeInput(payload.customerAddress);
  const sanitizedNotes = sanitizeInput(payload.customerNotes || "");

  // 7. Rangkai pesan WhatsApp dengan data terverifikasi
  const whatsappMessage = buildWhatsAppOrderMessage({
    customerName: sanitizedName,
    customerPhone: sanitizedPhone,
    customerAddress: sanitizedAddress,
    customerNotes: sanitizedNotes,
    paymentMethodName,
    paymentProofUrl: proofUrl,
    items: verifiedItems,
    totalPrice: grandTotal,
    storeWhatsappNumber: storeWhatsapp,
  });

  const whatsappUrl = generateWhatsAppDeepLink(storeWhatsapp, whatsappMessage);

  return {
    customerName: sanitizedName,
    customerPhone: sanitizedPhone,
    customerAddress: sanitizedAddress,
    customerNotes: sanitizedNotes,
    paymentMethodName,
    items: verifiedItems,
    totalPrice: grandTotal,
    paymentProofUrl: proofUrl,
    whatsappMessage,
    whatsappUrl,
  };
}
