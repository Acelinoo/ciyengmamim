# 🚀 RULE: ZERO-COST STATELESS PAYMENT PROOF ARCHITECTURE (BUDGET TIER)

Teknik ini adalah **standar wajib** untuk proyek website e-commerce / online ordering dengan **Paket Jasa Paling Murah (Entry-Level / UMKM / Zero Maintenance Cost)**.

---

## 🎯 1. Tujuan Bisnis & Keunggulan Layanan
* **Rp 0 Biaya Bulanan (Zero Maintenance Cost)**: Klien tidak perlu membayar sewa database cloud (PostgreSQL) atau object storage berbayar (AWS S3 / Cloudflare R2).
* **Bebas Stateless Issue Vercel**: Vercel Serverless Lambda tidak memiliki disk permanen, sehingga tautan gambar bukti bayar biasa akan 404 jika diakses dari instance serverless yang berbeda.
* **Pengalaman Premium**: Klien mendapatkan website dengan link verifikasi bukti pembayaran unik di WhatsApp yang langsung terbuka cepat dan rapi.

---

## ⚙️ 2. Arsitektur 4-Langkah: "Stateless CDN Token Pipeline"

1. **Client Upload & Sharp Compression**:
   * Gambar dikompresi di serverless API Next.js menggunakan `sharp` menjadi format WebP berukuran sangat ringan (<50KB, max width 1000px, quality 80).
2. **Stateless CDN Storage (Public Permanent Fallback)**:
   * File di-upload ke CDN publik permanen (seperti `catbox.moe` / `litterbox.catbox.moe`) yang mengembalikan direct image URL permanen tanpa memerlukan token API/kunci berbayar.
3. **Stateless Base64URL Encrypted Token**:
   * Direct CDN URL di-encode menjadi format token mandiri:
     ```text
     accessToken = "proof_p_" + Buffer.from(cdnUrl).toString("base64url");
     ```
   * Link bukti pembayaran yang disisipkan ke pesan WhatsApp:
     ```text
     https://domain.vercel.app/proof/proof_p_xxxxxxxxx
     ```
4. **Halaman Verifikasi Bukti (`/proof/[token]`)**:
   * Saat link dibuka di browser Safari iPhone, Chrome Android, atau WhatsApp in-app browser, sistem langsung mendekode token `proof_p_` kembali ke CDN URL:
     ```typescript
     if (token.startsWith("proof_p_")) {
       const rawCdnUrl = Buffer.from(token.replace("proof_p_", ""), "base64url").toString("utf-8");
       signedUrl = rawCdnUrl;
     }
     ```
   * Gambar langsung dirender di dalam template kartu verifikasi toko yang berkelas tanpa melakukan query database sama sekali.

---

## 💎 3. Nilai Jual untuk Paket Jasa Website Termurah
* **Jasa Pembuatan Website WhatsApp Checkout Otomatis**:
  1. Katalog Menu / Produk Interaktif.
  2. Keranjang Belanja & Custom Notes.
  3. Integrasi Pembayaran QRIS / Bank Transfer.
  4. Upload Bukti Transfer & Link Verifikasi Otomatis di Pesan WhatsApp.
  5. **100% Bebas Biaya Server / Hosting Selamanya di Vercel**.
