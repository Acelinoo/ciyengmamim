import { z } from "zod";

// 1. Checkout Form Client-to-Server Payload Schema
export const CheckoutPayloadSchema = z.object({
  customerName: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(60, "Nama maksimal 60 karakter"),
  customerPhone: z
    .string()
    .min(8, "Nomor WhatsApp minimal 8 digit"),
  customerAddress: z
    .string()
    .min(3, "Alamat / Info Pengantaran minimal 3 karakter")
    .max(300, "Alamat maksimal 300 karakter"),
  customerNotes: z.string().max(200, "Catatan maksimal 200 karakter").optional().default(""),
  paymentMethod: z.enum(["BANK_TRANSFER", "QRIS"], {
    message: "Pilih salah satu metode pembayaran",
  }),
  paymentProofToken: z.string().optional().nullable().default(""),
  appOrigin: z.string().optional(),
  items: z
    .array(
      z.object({
        cartItemId: z.string(),
        id: z.string().min(1, "Product ID wajib ada"),
        type: z.enum(["PRODUCT", "PACKAGE"]),
        quantity: z.number().int().min(1, "Minimal kuantitas adalah 1"),
        variantId: z.string().optional(),
        selectedSauces: z.array(z.string()).optional(),
        addonIds: z.array(z.string()).optional(),
      })
    )
    .min(1, "Keranjang belanja tidak boleh kosong"),
});

// 2. Admin Login Schema
export const AdminLoginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

// 3. Product CRUD Schema
export const ProductInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  slug: z.string().min(2, "Slug minimal 2 karakter"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().int().min(0, "Harga tidak boleh negatif"),
  imageUrl: z.string().min(1, "Foto produk wajib diunggah"),
  isAvailable: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Nama varian wajib diisi"),
        price: z.coerce.number().int().min(0, "Harga varian tidak boleh negatif"),
      })
    )
    .optional()
    .default([]),
});

// 4. Package CRUD Schema
export const PackageInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama paket minimal 2 karakter"),
  slug: z.string().min(2, "Slug minimal 2 karakter"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().int().min(0, "Harga paket tidak boleh negatif"),
  imageUrl: z.string().min(1, "Foto paket wajib diunggah"),
  packageItems: z.array(z.string()).min(1, "Minimal harus ada 1 item paket"),
  includedSauces: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

// 5. Addon CRUD Schema
export const AddOnInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama saus/add-on minimal 2 karakter"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().int().min(0, "Harga saus tidak boleh negatif"),
  imageUrl: z.string().optional().default(""),
  isAvailable: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

// 6. Payment Settings Schema
export const PaymentSettingsSchema = z.object({
  bankName: z.string().min(2, "Nama Bank wajib diisi"),
  accountNumber: z.string().min(4, "Nomor Rekening wajib diisi"),
  accountHolder: z.string().min(2, "Atas Nama Rekening wajib diisi"),
  bankNotes: z.string().optional().default(""),
  qrisImageUrl: z.string().min(1, "Gambar QRIS wajib ada"),
  qrisNmid: z.string().optional().default(""),
  isBankActive: z.boolean().default(true),
  isQrisActive: z.boolean().default(true),
});

// 7. Operational Settings Schema
export const OperationalSettingsSchema = z.object({
  isStoreOpen: z.boolean().default(true),
  autoSchedule: z.boolean().default(true),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam buka HH:mm"),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam tutup HH:mm"),
  closedDays: z.array(z.string()).default([]),
  closedMessage: z.string().min(5, "Pesan toko tutup minimal 5 karakter"),
});

// 8. Store Profile Schema
export const StoreSettingsSchema = z.object({
  storeName: z.string().min(2, "Nama toko minimal 2 karakter"),
  tagline: z.string().optional().default(""),
  logoUrl: z.string().optional().nullable(),
  whatsappNumber: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Nomor WhatsApp tidak valid"),
  instagramHandle: z.string().optional().default(""),
  instagramUrl: z.string().optional().default(""),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  mapsUrl: z.string().optional().default(""),
  mapsEmbedUrl: z.string().optional().nullable(),
});

// Aliases for admin actions compatibility
export const AddonInputSchema = AddOnInputSchema;
export const PaymentSettingsInputSchema = PaymentSettingsSchema;
export const OperationalSettingsInputSchema = OperationalSettingsSchema;
export const StoreSettingsInputSchema = StoreSettingsSchema;
