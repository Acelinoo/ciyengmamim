# 🚀 ZERO-COST STATELESS PAYMENT PROOF ARCHITECTURE (BUDGET TIER GUIDE)

Dokumentasi cetak biru untuk paket jasa website pemesanan WhatsApp paling hemat / murah (Zero Server Cost).

---

## 📌 Alur Kerja Teknis:

```text
[Pembeli Upload Struk]
       │
       ▼
[Next.js API: Sharp WebP Optimize (<50KB)]
       │
       ▼
[Upload ke CDN Stateless Permanen (Catbox/Litterbox)] ──> Menghasilkan Direct CDN URL
       │
       ▼
[Encode URL ke Token: proof_p_<base64url_cdn_url>]
       │
       ▼
[Generate Link WhatsApp: https://domain.vercel.app/proof/proof_p_xxxx]
       │
       ▼
[Pesan WA Terkirim ke Penjual]
       │
       ▼
[Penjual Klik Link WA -> Halaman /proof/[token] Decode URL Instan 100% Valid]
```

### Keuntungan Bisnis:
1. **Rp 0 Biaya Server / Database Bulanan**.
2. **100% Stateless & Reliable di Vercel**.
3. **Pesan WhatsApp Lengkap dengan Link Verifikasi Foto Resmi**.
