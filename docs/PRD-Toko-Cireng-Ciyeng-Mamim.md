---
title: "PRD & Technical Blueprint — Website Toko Cireng (Ciyeng Mamim) [WITH SECURITY PATCH]"
date: 2026-08-19
status: approved
version: 1.1.0-security-patched
tags: [prd, blueprint, toko-cireng, ciyengmamim, whatsapp-commerce, nextjs, fullstack, security-patch]
project: Ciyeng Mamim
author: Marchelino Kurniawan (Acelino)
---

# 📑 PRODUCT REQUIREMENTS DOCUMENT (PRD) & TECHNICAL BLUEPRINT
## Website Pemesanan Online Toko Cireng — **Ciyeng Mamim**
### *(Termasuk Spesifikasi Lengkap Security Patch v1.1.0)*

---

## 1. PRODUCT OVERVIEW

Website **Ciyeng Mamim** adalah platform katalog digital dan pemesanan online instan (*frictionless online ordering website*) untuk bisnis kuliner cireng & aneka saus/kuah spesial. 

Website ini dirancang secara khusus untuk menggabungkan **katalog interaktif, shopping cart, checkout instan, metode pembayaran dinamis, upload bukti pembayaran ke private storage, dan WhatsApp order message generator dengan kalkulasi harga server-side** dalam satu alur terpadu tanpa hambatan registrasi/login customer.

### 💡 Prinsip Arsitektur Utama:
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              WEBSITE LAYER                                  │
│  [KATALOG] ➔ [SHOPPING CART] ➔ [CHECKOUT] ➔ [UPLOAD BUKTI (PRIVATE)]        │
│                                      │                                      │
│                                      ▼                                      │
│                [SERVER-SIDE PRICE CALCULATION & VALIDATION]                 │
│                                      │                                      │
│                                      ▼                                      │
│                [WHATSAPP ORDER GENERATOR + SIGNED PROOF URL]                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Deep Link: wa.me)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          WHATSAPP TOKO (ADMIN)                              │
│                 Titik Akhir Transaksi & Order Fulfillment                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

> ⚠️ **IMPORTANT PRINCIPLE:** Website **BUKAN** sistem Order Management / POS / CRM Restoran. Website berfungsi sebagai *High-Converting Digital Menu, Secure Server-Validated Checkout, & WhatsApp Order Generator*. Seluruh proses komunikasi, verifikasi manual bukti transfer, dan pemrosesan pesanan operasional ditangani langsung oleh admin melalui WhatsApp.

---

## 2. GOALS

1. **Meningkatkan Konversi Pemesanan**: Menghadirkan tampilan menu yang modern, bersih, dan menggugah selera (*appetizing UI*) agar customer langsung terdorong memesan.
2. **Pemesanan Tanpa Hambatan (Zero-Friction)**: Customer dapat memilih varian cireng & saus, checkout, dan mengunggah bukti bayar tanpa perlu mendaftar atau login akun.
3. **Integritas Harga Mutlak (Price Integrity)**: Kalkulasi harga total dihitung 100% di server berdasarkan harga database aktual, mencegah manipulasi harga dari client/browser.
4. **Penyimpanan Bukti Bayar Privat (Private Storage & Signed URLs)**: Bukti transfer disimpan di bucket privat non-publik dan hanya dapat diakses melalui Signed URL bertenggat waktu (*expiring signed URL*).
5. **Standarisasi Format Pesanan WhatsApp**: Mengeliminasi kesalahan penulisan pesanan manual dengan menghasilkan teks pesanan WhatsApp yang terstruktur rapi.
6. **Admin CMS Terproteksi Berlapis**: Autentikasi HttpOnly JWT session dan otorisasi server-side di setiap Server Action / API Route.
7. **Performa & Visual Kelas Atas**: Target skor Google Lighthouse 95–100 pada Mobile & Desktop.

---

## 3. NON-GOALS (OUT OF SCOPE)

Fitur-fitur berikut secara tegas **TIDAK DIBUAT**:
- ❌ Customer Account / Login / Registrasi / Profil Pengguna.
- ❌ Order Management System / Kitchen Display System / POS Kasir di website.
- ❌ Order Status Tracking di web (Menyiapkan, Diantar, Selesai, Batal).
- ❌ Verifikasi Pembayaran Otomatis / Webhook Payment Gateway (Midtrans/Xendit).
- ❌ WhatsApp Incoming Webhook / WhatsApp Bot Auto-reply.
- ❌ Integrasi Kurir Eksternal API / Live Delivery Tracking.
- ❌ Inventory Stock Tracking tingkat bahan baku / akuntansi harian.
- ❌ Loyalty Points, Referral System, & Review/Rating System.

---

## 4. USER PERSONAS

| Persona | Profil & Kebutuhan | Peran Keamanan & Fungsional |
| :--- | :--- | :--- |
| **Customer ("Laper Cepat")** | Mengakses web via Instagram/TikTok di smartphone, ingin pesan cireng + saus taichan/creamy dengan cepat tanpa ribet. | Guest User: Hanya mengirim payload item IDs & upload bukti transfer; harga divalidasi server; tidak memiliki akses admin. |
| **Admin / Pemilik Toko** | Pengelola operasional toko Ciyeng Mamim yang memproses pesanan melalui chat WhatsApp. | Authenticated User: Memiliki hak kelola menu, harga, jam toko, rekening/QRIS, dan melihat audit log. |

---

## 5. USER JOURNEY

```mermaid
journey
    title Customer Ordering Experience Journey
    section Discovery
      Membuka Website via Instagram/Link: 5: Customer
      Melihat Status Toko (BUKA/TUTUP): 5: Customer
      Melihat Hero & Highlight Menu: 5: Customer
    section Selection
      Memilih Cireng Satuan / Paket: 5: Customer
      Kustomisasi Kuah & Add-on: 5: Customer
      Menambahkan ke Keranjang (Cart Drawer): 5: Customer
    section Checkout & Payment
      Melihat Ringkasan Keranjang: 5: Customer
      Mengisi Nama & No. WhatsApp: 4: Customer
      Memilih Metode Pembayaran (QRIS / Transfer BCA): 5: Customer
      Upload Bukti Transfer (Magic-byte verified): 4: Customer
    section Server Verification
      Server Menguji Ketersediaan Menu & Menghitung Harga DB: 5: System
      Server Menyimpan Bukti ke Private Bucket & Generate Signed URL: 5: System
      Server Merangkai Template Pesanan WhatsApp: 5: System
    section Handover
      Klik "Kirim Pesanan via WhatsApp": 5: Customer
      Chat WhatsApp Terbuka & Mengirim Pesan: 5: Customer
      Admin Verifikasi Manual Bukti via Signed URL: 5: Admin
```

---

## 6. FUNCTIONAL REQUIREMENTS

### 6.1 Sisi Customer
- **FR-C01 (Catalog Display)**: Sistem menampilkan daftar produk tunggal, paket bundling, dan add-on/kuah beserta foto, nama, deskripsi, harga resmi, dan status stok.
- **FR-C02 (Product Customization)**: Customer dapat memilih varian rasa, saus bawaan paket, dan kuah ekstra.
- **FR-C03 (Client-side Shopping Cart)**: Customer dapat mengelola cart lokal di `localStorage`.
- **FR-C04 (Checkout Form)**: Form mengumpulkan data esensial: Nama, Nomor WhatsApp, Alamat Pengantaran, Catatan Pesanan, dan Metode Bayar.
- **FR-C05 (Dynamic Payment Display)**: Menampilkan rekening bank atau gambar QRIS dinamis.
- **FR-C06 (Private Payment Proof Upload)**: Form mengunggah gambar bukti transfer ke private bucket dengan validasi magic bytes dan UUID filename.
- **FR-C07 (Server-Side Price Calculation & WhatsApp Dispatch)**: Saat submit checkout, payload item dikirim ke server. Server menghitung total harga murni dari database, menghasilkan signed URL bukti bayar (TTL 72 jam), dan merangkai teks WhatsApp yang valid.
- **FR-C08 (Store Operational Awareness)**: Menampilkan status BUKA / TUTUP toko secara dinamis.

### 6.2 Sisi Admin
- **FR-A01 (Secure Authentication)**: Login admin dengan password terenkripsi (`argon2id` / `bcrypt-ts`) dan session HttpOnly Secure SameSite Cookie.
- **FR-A02 (Server-Side Authorization)**: Setiap Server Action / API Route admin memverifikasi session aktif di sisi server sebelum menjalankan mutasi.
- **FR-A03 (Menu & Package CRUD)**: Kelola menu cireng, harga, foto, varian, dan paket bundling.
- **FR-A04 (Add-on & Sauce CRUD)**: Kelola harga dan stok aneka saus.
- **FR-A05 (Payment Configuration)**: Kelola rekening bank dan upload QRIS toko.
- **FR-A06 (Operational Configuration)**: Toggle buka/tutup toko dan jam kerja.
- **FR-A07 (Store Profile & Audit Log)**: Update profil toko dan pemantauan catatan log aktivitas sensitif admin.

---

## 7. CUSTOMER FLOW

```text
[ HOMEPAGE ] ➔ Cek Status Operasional (Banner Buka/Tutup)
     │
     ▼
[ PILIH PRODUK / PAKET ] ➔ Buka Customizer (Varian + Pilihan Kuah + Ekstra Add-on)
     │
     ▼
[ KERANJANG BELANJA ] ➔ Cek Quantity ➔ Klik "Lanjut ke Pembayaran"
     │
     ▼
[ FORM CHECKOUT ] ➔ Isi Nama, No WA, Alamat ➔ Pilih [Transfer Bank] / [QRIS]
     │
     ▼
[ UPLOAD BUKTI BAYAR ]
     │  ├─ Validasi Magic Bytes (JPEG/PNG/WEBP/HEIC, max 5MB)
     │  ├─ Upload ke Private Storage dengan Random UUID filename
     │  └─ Generate Expiring Signed URL (TTL 72 Jam)
     │
     ▼
[ SERVER CHECKOUT PROCESSING ]
     │  ├─ Server ambil ID produk/paket/add-on dari DB
     │  ├─ Server verifikasi ketersediaan (isAvailable == true)
     │  ├─ Server hitung ulang Subtotal & Total dari DB (Anti Price Manipulation)
     │  └─ Server susun Teks Pesanan WhatsApp + Expiring Signed URL
     │
     ▼
[ WHATSAPP DISPATCH ] ➔ Buka wa.me ➔ Customer tekan Kirim ➔ Admin Verifikasi Manual ➔ SELESAI
```

---

## 8. ADMIN FLOW & AUTHORIZATION GATEWAY

```text
[ LOGIN PAGE (/admin/login) ]
     │
     ├─ Input Email & Password (Rate Limited: Max 5 attempts / 15 mins)
     ├─ Argon2id / Bcrypt Verify Password
     └─ Set HttpOnly, Secure, SameSite=Lax JWT Session Cookie
     │
     ▼
[ SERVER AUTHORIZATION GATEWAY (requireAdminSession()) ]
     │ (Dijalankan di setiap rute & Server Action)
     ├──► [ Kelola Menu ] (/admin/menu) ➔ Server-side Session Check ➔ Mutasi DB + Audit Log
     ├──► [ Kelola Paket ] (/admin/packages) ➔ Server-side Session Check ➔ Mutasi DB + Audit Log
     ├──► [ Kelola Add-on ] (/admin/addons) ➔ Server-side Session Check ➔ Mutasi DB + Audit Log
     ├──► [ Pembayaran ] (/admin/payment) ➔ Server-side Session Check ➔ Update Bank/QRIS + Audit Log
     ├──► [ Operasional ] (/admin/operations) ➔ Server-side Session Check ➔ Update Jam + Audit Log
     └──► [ Profil Toko ] (/admin/store-info) ➔ Server-side Session Check ➔ Update Kontak + Audit Log
```

---

## 9. INFORMATION ARCHITECTURE

```text
Ciyeng Mamim Web Platform
├── 🌐 Public Client (Mobile-First)
│   ├── 🏠 Homepage (/)
│   │   ├── Top Operational Bar
│   │   ├── Header & Floating Cart Button
│   │   ├── Hero Section ("Food Mood" Neo-Gourmet Headline & Mascot)
│   │   ├── Highlight Paket Bundling
│   │   ├── Katalog Menu Cireng & Kuah
│   │   ├── Langkah Pemesanan
│   │   ├── Lokasi & Info Toko
│   │   └── Footer
│   ├── 🛒 Cart Sheet / Drawer
│   ├── 💳 Checkout Modal (Integrasi Server-Price Engine & Upload Bukti)
│   └── 🖼️ Secure Proof Viewer (/proof/[token]) (Validasi token & redirect ke Signed URL)
└── 🔒 Admin CMS Area (/admin)
    ├── 🔑 Login (/admin/login)
    ├── 🍱 Menu Manager (/admin/menu)
    ├── 📦 Package Manager (/admin/packages)
    ├── 🥣 Add-on & Sauce Manager (/admin/addons)
    ├── 💸 Payment Config (/admin/payment)
    ├── ⏰ Operational Config (/admin/operations)
    └── 🏪 Store Profile (/admin/store-info)
```

---

## 10. SITEMAP

| Route Path | Akses | Proteksi Keamanan | Fungsi |
| :--- | :--- | :--- | :--- |
| `/` | Publik | Rate Limited (Checkout) | Homepage, Katalog Menu, Cart Drawer, Checkout |
| `/proof/[token]` | Publik / Admin | Token Validation & Expiring Signed URL | Viewer bukti bayar aman yang diklik dari WA |
| `/admin/login` | Publik (Guest) | Rate Limited (Brute Force Guard) | Halaman login admin |
| `/admin` | Admin | Middleware + Session Check | Redirect ke `/admin/menu` |
| `/admin/menu` | Admin | Server-Side Auth Check | Manajemen produk cireng |
| `/admin/packages` | Admin | Server-Side Auth Check | Manajemen paket bundling |
| `/admin/addons` | Admin | Server-Side Auth Check | Manajemen saus & add-on |
| `/admin/payment` | Admin | Server-Side Auth Check | Konfigurasi rekening bank & QRIS |
| `/admin/operations`| Admin | Server-Side Auth Check | Konfigurasi jam operasional |
| `/admin/store-info` | Admin | Server-Side Auth Check | Konfigurasi profil toko & WhatsApp |
| `/api/upload/proof`| Publik | Rate Limited, Magic-byte validated | Endpoint upload bukti bayar ke private bucket |
| `/robots.txt` & `/sitemap.xml` | Publik | Static Headers | SEO indexing |

---

## 11. PAGE SPECIFICATION & VISUAL DESIGN IDENTITY

### 🎨 Visual Design Guidelines (Neo-Gourmet Food Mood Aesthetic):
- **Gaya Desain**: *Playful Warm Neo-Gourmet Street Food* — Bersih, modern, hangat, dan menggugah selera.
- **Palet Warna**:
  - `Background`: Warm Vanilla Cream (`#FAF7F0` / `#FFFDF9`)
  - `Surface / Cards`: Soft Pastel Yellow (`#FFF4D2`), Soft Peach Rose (`#FFE8E1`), Soft Lavender (`#F0EDFF`), Crisp White (`#FFFFFF`)
  - `Text Utama`: Deep Charcoal Onyx (`#18181B` / `#111827`)
  - `Appetite Accent`: Golden Amber (`#F59E0B`), Taichan Crimson (`#E11D48`), Olive Herb (`#15803D`)
- **Tipografi**:
  - `Headlines`: Bold Extended Display Font (*Syne* / *Cabinet Grotesk* / *Plus Jakarta Sans ExtraBold*)
  - `Body / UI`: Clean Modern Sans (*Inter* / *Plus Jakarta Sans*)
- **Elemen UI**: Rounded pill cards, floating food highlights, badge saus berbentuk kapsul lembut, dan tombol kontras tinggi yang nyaman diakses jempol pada smartphone.

---

## 12. COMPONENT ARCHITECTURE

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                     // Main Landing & Ordering Page
│   │   ├── proof/[token]/page.tsx       // Secure Proof Viewer
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               // Admin Shell with Auth Guard
│   │   │   ├── menu/page.tsx
│   │   │   ├── packages/page.tsx
│   │   │   ├── addons/page.tsx
│   │   │   ├── payment/page.tsx
│   │   │   ├── operations/page.tsx
│   │   │   └── store-info/page.tsx
│   │   └── login/page.tsx
│   └── api/
│       └── upload/proof/route.ts        // Secure Private Upload Handler
├── components/
│   ├── public/
│   │   ├── OperationalBanner.tsx
│   │   ├── HeaderNav.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ProductCatalog.tsx
│   │   ├── ProductCard.tsx
│   │   ├── PackageCard.tsx
│   │   ├── ProductCustomizerModal.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CheckoutModal.tsx
│   │   ├── PaymentDetailsBox.tsx
│   │   ├── ProofUploader.tsx
│   │   └── StoreFooter.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── AdminHeader.tsx
│       ├── ProductFormModal.tsx
│       ├── PackageFormModal.tsx
│       ├── AddonFormModal.tsx
│       └── ImageDropzone.tsx
├── lib/
│   ├── auth/
│   │   └── session.ts                   // requireAdminSession() Helper
│   ├── db.ts                            // Prisma Client
│   ├── storage.ts                       // Private Storage & Signed URL Generator
│   ├── security/
│   │   ├── rate-limit.ts                // Sliding Window Rate Limiter
│   │   ├── magic-bytes.ts               // File Header Signature Validator
│   │   └── sanitize.ts                  // XSS Input Sanitizer
│   ├── checkout/
│   │   └── calculate-order.ts           // Server-Side Price Calculation Engine
│   ├── whatsapp.ts                      // WhatsApp Message Template Engine
│   ├── operational.ts                   // Timezone & Operational Resolver
│   └── validations.ts                   // Zod Validation Schemas
└── types/
    └── index.ts
```

---

## 13. DATABASE SCHEMA (PRISMA & POSTGRESQL)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Admin User
model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String   // Hashed with argon2id / bcrypt-ts (NOT plaintext)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 2. Admin Audit Log (Keamanan Aktivitas Sensitif)
model AdminAuditLog {
  id         String   @id @default(cuid())
  adminEmail String
  action     String   // e.g. "UPDATE_PAYMENT_CONFIG", "DELETE_PRODUCT", "CHANGE_PRICE"
  resource   String   // e.g. "PaymentSettings", "Product:clx123"
  details    String?  // JSON stringified summary of change
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@index([adminEmail])
  @@index([createdAt])
}

// 3. Store Profile & Contact Information
model StoreSettings {
  id              String   @id @default("default_store")
  storeName       String   @default("Ciyeng Mamim")
  tagline         String?  @default("Cireng Crispy Renyah dengan Aneka Saus Spesial")
  logoUrl         String?
  whatsappNumber  String   @default("6281234567890") // Sanitized international format
  instagramHandle String?  @default("ciyengmamim")
  instagramUrl    String?
  address         String?
  mapsUrl         String?
  mapsEmbedUrl    String?
  updatedAt       DateTime @updatedAt
}

// 4. Operational Hours & Live Store Status
model OperationalSettings {
  id             String   @id @default("default_operational")
  isStoreOpen    Boolean  @default(true) // Manual Master Override
  autoSchedule   Boolean  @default(true)
  openTime       String   @default("10:00") // Format HH:mm (WIB)
  closeTime      String   @default("21:00") // Format HH:mm (WIB)
  closedDays     String[] @default(["Senin"])
  closedMessage  String?  @default("Toko sedang tutup. Kami kembali melayani di jam operasional.")
  updatedAt      DateTime @updatedAt
}

// 5. Products (Cireng)
model Product {
  id          String          @id @default(cuid())
  name        String
  slug        String          @unique
  description String?
  price       Int             // Harga Rupiah resmi di DB (Master Price)
  imageUrl    String
  isAvailable Boolean         @default(true)
  sortOrder   Int             @default(0)
  variants    VariantOption[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model VariantOption {
  id        String   @id @default(cuid())
  name      String   // Misal: "Original", "Extra Bumbu Pedas"
  price     Int      @default(0) // Tambahan harga resmi di DB
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

// 6. Package Bundling Items
model Package {
  id             String   @id @default(cuid())
  name           String   // Misal: "Paket Puas A"
  slug           String   @unique
  description    String?
  price          Int      // Total harga resmi paket di DB
  imageUrl       String
  packageItems   String[] // Array teks isi paket, cth: ["10x Cireng", "1x Taichan"]
  includedSauces String[] // Daftar saus bawaan yang diizinkan
  isAvailable    Boolean  @default(true)
  sortOrder      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

// 7. Add-ons & Extra Sauces
model AddOn {
  id          String   @id @default(cuid())
  name        String   // Misal: "Saus Taichan Pedas", "Creamy Ranch"
  description String?
  price       Int      // Harga satuan resmi di DB
  imageUrl    String?
  isAvailable Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 8. Payment Configurations
model PaymentSettings {
  id            String   @id @default("default_payment")
  bankName      String   @default("BCA")
  accountNumber String   @default("1234567890")
  accountHolder String   @default("CIYENG MAMIM")
  bankNotes     String?  @default("Mohon transfer sesuai total tagihan.")
  qrisImageUrl  String?
  qrisNmid      String?
  isQrisActive  Boolean  @default(true)
  isBankActive  Boolean  @default(true)
  updatedAt     DateTime @updatedAt
}

// 9. Payment Proof Metadata (Private Storage + Expiring Token)
model PaymentProof {
  id          String   @id @default(cuid())
  accessToken String   @unique @default(cuid()) // Unpredictable Token untuk URL WhatsApp
  filePath    String   // Private Storage Path (e.g. "proofs/uuid.webp")
  fileSize    Int
  mimeType    String
  uploadedAt  DateTime @default(now())
  expiresAt   DateTime // Retention TTL (14 hari untuk auto-cleanup DB & Storage)

  @@index([accessToken])
  @@index([expiresAt])
}
```

---

## 14. STORAGE ARCHITECTURE & SIGNED URLS

### 14.1 Private Storage Configuration
- **Bucket Visibility**: **100% PRIVATE**. Seluruh akses anonim publik langsung ke bucket ditolak (*No Public Read / No Directory Listing*).
- **Service-Role Key**: Hanya berada di backend server environment (`R2_SECRET_ACCESS_KEY` / `SUPABASE_SERVICE_ROLE_KEY`), tidak pernah di-bundle ke client.

### 14.2 Upload & Signed URL Lifecycle
1. **Upload Execution**:
   - File diunggah ke private folder: `proofs/{random_uuid}.webp`.
   - File asli di-rename total menjadi `crypto.randomUUID() + ".webp"`.
2. **Signed URL Generation**:
   - Backend menghasilkan *Presigned / Signed URL* dengan tenggat waktu (*Expiration TTL: 72 Jam*).
   - Tautan yang disematkan ke pesan WhatsApp berupa:
     ```text
     https://ciyengmamim.com/proof/{accessToken}
     ```
     Saat admin membuka tautan tersebut, server memvalidasi `accessToken` dan me-redirect browser admin ke Signed URL aktif dari private storage. Jika token kedaluwarsa atau tidak valid, sistem menampilkan halaman error aman.
3. **Storage Retention**: Cron job harian menghapus file dari private bucket dan database setelah 14 hari.

---

## 15. AUTHENTICATION & AUTHORIZATION SPECIFICATION

### 15.1 Authentication Standard
- Admin login via `/admin/login` divalidasi dengan password hash `argon2id` (atau `bcrypt` cost factor 12).
- Session dikelola oleh **NextAuth v5** dengan strategi JWT session.
- Token session disimpan secara eksklusif dalam cookie:
  ```text
  Set-Cookie: __Secure-authjs.session-token=...; 
              HttpOnly; 
              Secure; 
              SameSite=Lax; 
              Path=/; 
              Max-Age=86400
  ```
- Kredensial admin **TIDAK PERNAH** disimpan di `localStorage` atau `sessionStorage`.
- Pada aksi logout, cookie session langsung di-clear dan di-invalidate total di sisi server.

### 15.2 Mandatory Server-Side Authorization Helper (`requireAdminSession`)
Setiap Server Action atau API Route yang memodifikasi data **WAJIB** mengeksekusi helper berikut sebelum menjalankan query:

```typescript
// src/lib/auth/session.ts
import { auth } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED: Akses ditolak. Diperlukan hak akses admin.");
  }
  return session.user;
}
```

*Contoh Penerapan pada Server Action:*
```typescript
export async function updateProductAction(data: ProductInput) {
  const admin = await requireAdminSession(); // 🔒 Authorization Check
  
  // Lakukan validasi Zod & query DB
  const result = await db.product.update({ ... });
  
  // Catat Audit Log
  await logAdminAction(admin.email, "UPDATE_PRODUCT", `Product:${data.id}`);
  return { success: true, product: result };
}
```

---

## 16. PRICE INTEGRITY & SERVER-SIDE PRICE ENGINE

> ⚠️ **CRITICAL SECURITY RULE:** Server **DILARANG KERAS** mempercayai total harga, subtotal, atau nominal harga item yang dikirim dari browser.

### 16.1 Payload yang Dikirim Client ke Server
Client hanya mengirimkan identitas pilihan belanja (tanpa harga):
```json
{
  "customerName": "Acelino",
  "customerPhone": "081234567890",
  "customerAddress": "Jl. Boulevard No. 8",
  "customerNotes": "Kuah dipisah",
  "paymentMethod": "BANK_TRANSFER",
  "paymentProofToken": "clx_proof_uuid",
  "items": [
    {
      "type": "PRODUCT",
      "id": "prod_cireng_ori",
      "quantity": 2,
      "variantId": "var_pedas",
      "addonIds": ["addon_taichan"]
    },
    {
      "type": "PACKAGE",
      "id": "pkg_puas_b",
      "quantity": 1,
      "selectedSauces": ["Taichan Pedas", "Creamy Ranch"],
      "addonIds": ["addon_cheese"]
    }
  ]
}
```

### 16.2 Server-Side Calculation & Integrity Algorithm
```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser Client
    participant Server as Server Checkout Action
    participant DB as PostgreSQL Database
    
    Client->>Server: Kirim Payload ID & Quantity
    Server->>DB: Query Data Produk, Paket, Varian, & Add-on Aktif
    DB-->>Server: Return Data Master (Harga, isAvailable, Relasi)
    
    Server->>Server: 1. Validasi Keberadaan & Status isAvailable == true
    Server->>Server: 2. Validasi Relasi Varian ke Product ID
    Server->>Server: 3. Validasi Included Sauces pada Paket
    Server->>Server: 4. Hitung Subtotal = (Harga Produk DB + Varian DB + Addons DB) * Quantity
    Server->>Server: 5. Hitung Grand Total Resmi Server-Side
    
    Server->>Server: 6. Rangkai Pesanan WhatsApp dengan Total Resmi DB
    Server-->>Client: Return { success: true, whatsappUrl: "https://wa.me/..." }
```

---

## 17. FILE UPLOAD SECURITY & MAGIC BYTES VALIDATION

Upload bukti transfer diverifikasi secara mendalam melalui signature byte file:

### 17.1 Magic Bytes / File Signature Check
Server memeriksa buffer header file yang diunggah:
- **JPEG**: Buffer dimulai dengan `FF D8 FF`
- **PNG**: Buffer dimulai dengan `89 50 4E 47 0D 0A 1A 0A`
- **WEBP**: Buffer memuat signature `RIFF` dan `WEBP`
- **HEIC / HEIF**: Buffer memuat marker `ftypheic` / `ftypmif1`

*File executable (`.exe`, `.php`, `.js`, `.sh`, `.html`) yang diganti ekstensinya menjadi `.jpg` akan langsung ditolak pada level pemeriksaan buffer.*

### 17.2 Sanitasi Nama File & Path
- Nama file asli dari customer (misal `../../evil.php.jpg`) **dibuang sepenuhnya**.
- Nama file baru di-generate dengan:
  ```typescript
  const safeFilename = `${crypto.randomUUID()}.webp`;
  const storagePath = `proofs/${new Date().getFullYear()}/${safeFilename}`;
  ```
- Ukuran file maksimum dibatasi ketat: **5MB**.

---

## 18. WHATSAPP ORDER GENERATOR & PAYMENT DISCLAIMER

### 18.1 WhatsApp Order Message Structure
```text
Halo Ciyeng Mamim, saya ingin memesan:

━━━━━━━━━━━━━━━━━━━━
📋 DATA PEMESAN
━━━━━━━━━━━━━━━━━━━━
Nama: {CUSTOMER_NAME_SANITIZED}
No. WhatsApp: {CUSTOMER_PHONE_SANITIZED}
Alamat / Pengantaran:
{CUSTOMER_ADDRESS_SANITIZED}

━━━━━━━━━━━━━━━━━━━━
🛒 DETAIL PESANAN
━━━━━━━━━━━━━━━━━━━━
{SERVER_VERIFIED_ITEMS_FORMATTED}

Catatan Khusus:
{CUSTOMER_NOTES_SANITIZED}

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL & PEMBAYARAN
━━━━━━━━━━━━━━━━━━━━
Total Pembayaran: Rp{SERVER_CALCULATED_TOTAL}
Metode Pembayaran: {PAYMENT_METHOD_NAME}

Bukti Pembayaran (Private Signed Link):
https://ciyengmamim.com/proof/{ACCESS_TOKEN}

⚠️ Catatan: Pesanan akan diproses setelah bukti pembayaran diverifikasi oleh Admin.

Terima kasih! Mohon segera diproses ya kak 🙏✨
```

### 18.2 Payment Verification Disclaimer
Website menampilkan banner transparan pada halaman checkout:
> ℹ️ **Konfirmasi Pembayaran**: Mengunggah bukti pembayaran **bukan** merupakan verifikasi otomatis. Admin Ciyeng Mamim akan memeriksa keabsahan transfer secara manual via WhatsApp sebelum pesanan mulai disiapkan.

---

## 19. RATE LIMITING SPECIFICATION

Implementasi Sliding Window Rate Limiter (menggunakan In-Memory Cache / Upstash Redis di edge):

| Endpoint / Action | Limit Maksimum | Window | Tindakan saat Melanggar |
| :--- | :--- | :--- | :--- |
| **Admin Login (`/admin/login`)** | 5 request | 15 Menit | Blokir IP selama 15 menit + Status 429 |
| **Upload Bukti Bayar (`/api/upload/proof`)** | 5 upload | 10 Menit | Tolak upload + Status 429 (Mencegah storage spam) |
| **Server Checkout Processing** | 10 request | 5 Menit | Tolak request checkout berulang |
| **Admin Sensitive Mutations** | 30 request | 1 Menit | Throttling request mutasi admin |

---

## 20. SECURITY HEADERS & NEXT.JS CONFIGURATION

Konfigurasi keamanan pada `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // Menghapus header "X-Powered-By: Next.js"
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 21. ENVIRONMENT VARIABLES ISOLATION

```env
# 🔒 SERVER-ONLY SECRETS (TIDAK BOLEH DIAWALI NEXT_PUBLIC_)
DATABASE_URL="postgresql://user:password@host:5432/ciyengmamim?sslmode=require"
AUTH_SECRET="super-secret-random-32-character-key"
ADMIN_DEFAULT_EMAIL="admin@ciyengmamim.com"
ADMIN_DEFAULT_PASSWORD="hashed_initial_password"

# Private Storage (Cloudflare R2 / S3 / Supabase)
STORAGE_ENDPOINT="https://xxxx.r2.cloudflarestorage.com"
STORAGE_BUCKET_NAME="ciyengmamim-private-bucket"
STORAGE_ACCESS_KEY_ID="your_r2_access_key"
STORAGE_SECRET_ACCESS_KEY="your_r2_secret_key"

# 🌐 PUBLIC ENVIRONMENT VARIABLES (AMAN DI-BUNDLE KE BROWSER)
NEXT_PUBLIC_APP_URL="https://ciyengmamim.com"
```

---

## 22. SANITIZATION & XSS PROTECTION

- Seluruh string input customer (Nama, Alamat, Catatan) disaring menggunakan helper sanitasi sebelum digunakan dalam query DB, pesan WA, atau dirender ke DOM:
  ```typescript
  export function sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }
  ```
- Parameterized Query: Semua interaksi database menggunakan query builder terparameterisasi dari **Prisma ORM** (zero raw string concatenation SQL).

---

## 23. PRODUCTION ERROR HANDLING

- Di lingkungan `NODE_ENV === "production"`, seluruh response error ke client diseragamkan menjadi pesan umum:
  ```json
  {
    "success": false,
    "error": "Terjadi kendala saat memproses permintaan Anda. Silakan coba beberapa saat lagi."
  }
  ```
- Stack trace, SQL error, connection string, atau internal file path hanya dicatat ke logger internal server (*server logs*).

---

## 24. SECURITY ACCEPTANCE CHECKLIST

- [x] **Admin Authentication**: Password di-hash dengan `argon2id` / `bcrypt`, session diatur via HttpOnly Secure SameSite cookie.
- [x] **Admin Authorization**: Helper `requireAdminSession()` terpasang di seluruh admin mutations & Server Actions.
- [x] **Private Storage**: Bucket bukti transfer bersifat private 100%, akses menggunakan Expiring Signed URLs.
- [x] **File Validation**: Validasi ukuran 5MB, format magic bytes, dan random UUID filename.
- [x] **Price Integrity**: Kalkulasi subtotal & total dihitung 100% di server dari data harga database.
- [x] **Input Validation**: Schema Zod memvalidasi seluruh input customer & admin.
- [x] **XSS & SQL Injection Defense**: Prisma parameterized queries + HTML entity escaping.
- [x] **Rate Limiting**: Diterapkan pada login admin, upload bukti bayar, dan submit checkout.
- [x] **Security Headers**: HSTS, CSP, X-Content-Type-Options: nosniff, Frame-Options: DENY.
- [x] **Secrets Isolation**: Kredensial database & storage terkunci di environment server.
- [x] **Payment Disclaimer**: Penegasan bahwa upload bukti transfer memerlukan verifikasi manual admin.

---

Dokumen Blueprint & Security Patch v1.1.0 ini berstatus **FINAL & APPROVED**, siap dijadikan panduan implementasi teknis kode produksi.
