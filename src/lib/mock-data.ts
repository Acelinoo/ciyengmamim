import {
  StoreSettingsType,
  OperationalSettingsType,
  PaymentSettingsType,
  ProductItem,
  PackageItem,
  AddOnItem,
} from "@/types";

export const INITIAL_STORE_SETTINGS: StoreSettingsType = {
  id: "default_store",
  storeName: "Ciyeng Mamim",
  tagline: "Balikin Mood with Good Food",
  logoUrl: "/images/logo.webp",
  whatsappNumber: "6289676636637",
  instagramHandle: "ciyengmamim",
  instagramUrl: "https://instagram.com/ciyengmamim",
  address: "Jl Raya gading tutuka GC Kuliner pujasera, Soreang",
  mapsUrl:
    "https://www.google.com/maps/place/Ciyeng+Mamim+(Cireng+isi+PREMIUM)/@-7.022391,107.5423507,17z/data=!4m8!3m7!1s0x2e68ed0069a4a477:0xfe01ca13fc50ae11!8m2!3d-7.022391!4d107.5423507!9m1!1b1!16s%2Fg%2F11zgcxh3wm?entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D",
  mapsEmbedUrl: null,
};

export const INITIAL_OPERATIONAL_SETTINGS: OperationalSettingsType = {
  id: "default_operational",
  isStoreOpen: true,
  autoSchedule: true,
  openTime: "15:00",
  closeTime: "21:00",
  closedDays: ["Senin"],
  closedMessage:
    "Toko Ciyeng Mamim sedang tutup. Silakan cek jam operasional atau pesan kembali esok hari.",
};

export const INITIAL_PAYMENT_SETTINGS: PaymentSettingsType = {
  id: "default_payment",
  bankName: "BCA",
  accountNumber: "7772345678",
  accountHolder: "CIYENG MAMIM",
  bankNotes: "Mohon transfer sesuai total tagihan dan unggah bukti transfer.",
  qrisImageUrl:
    "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=400&q=80",
  qrisNmid: "ID1020030040050",
  isBankActive: true,
  isQrisActive: true,
  isCodActive: true,
  codNotes: "Bayar tunai/cash langsung saat pesanan diambil atau diantar.",
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod_1",
    name: "Ayam Rica",
    slug: "ayam-rica",
    description: "Ayam Suir Pedas Gurih Dengan Rempah Pilihan",
    price: 3500,
    imageUrl: "/images/cireng-ayam-rica.webp",
    isAvailable: true,
    sortOrder: 1,
    variants: [
      { id: "var_1", name: "Pedas Sedang", price: 0 },
      { id: "var_2", name: "Extra Pedas", price: 500 },
    ],
  },
  {
    id: "prod_2",
    name: "Sapi Teriyaki",
    slug: "sapi-teriyaki",
    description: "Daging Sapi Pedas Manis Dengan Rempah Pilihan",
    price: 4500,
    imageUrl: "/images/cireng-sapi-teriyaki.webp",
    isAvailable: true,
    sortOrder: 2,
    variants: [
      { id: "var_3", name: "Original", price: 0 },
      { id: "var_4", name: "Pedas", price: 500 },
    ],
  },
  {
    id: "prod_3",
    name: "Paru Rica",
    slug: "paru-rica",
    description: "Daging Paru Pedas Nampol, Cireng Isi Pertama Dengan Rasa Paru Rica",
    price: 4000,
    imageUrl: "/images/cireng-paru-rica.webp",
    isAvailable: true,
    sortOrder: 3,
    variants: [
      { id: "var_5", name: "Pedas Nampol", price: 0 },
      { id: "var_6", name: "Extra Daun Jeruk", price: 500 },
    ],
  },
  {
    id: "prod_4",
    name: "Pizza",
    slug: "pizza",
    description: "Potongan Sosis Dengan Sauce Bolognese Tidak Terlalu Pedas",
    price: 3500,
    imageUrl: "/images/cireng-pizza.webp",
    isAvailable: true,
    sortOrder: 4,
    variants: [
      { id: "var_7", name: "Original", price: 0 },
      { id: "var_8", name: "Extra Cheese", price: 1000 },
    ],
  },
  {
    id: "prod_5",
    name: "Keju",
    slug: "keju",
    description: "Parutan Keju Cheddar Yg Gurih Dan Nikmat",
    price: 3500,
    imageUrl: "/images/cireng-keju.webp",
    isAvailable: true,
    sortOrder: 5,
    variants: [
      { id: "var_9", name: "Original", price: 0 },
      { id: "var_10", name: "Pedas", price: 500 },
    ],
  },
  // =========================================================================
  // CIRENG VERSI MENTAHAN (SIAP GORENG ISI 10 PCS)
  // =========================================================================
  {
    id: "prod_mentah_1",
    name: "Cireng Mentah - Sapi Teriyaki (10 pcs)",
    slug: "cireng-mentah-sapi-teriyaki-10-pcs",
    description: "Cireng mentahan siap goreng isi daging sapi pedas manis dengan rempah pilihan (10 pcs)",
    price: 55000,
    imageUrl: "/images/cireng-sapi-teriyaki.webp",
    isAvailable: true,
    sortOrder: 6,
    variants: [
      { id: "var_m_1", name: "Original", price: 0 },
      { id: "var_m_2", name: "Pedas", price: 0 },
    ],
  },
  {
    id: "prod_mentah_2",
    name: "Cireng Mentah - Paru Rica (10 pcs)",
    slug: "cireng-mentah-paru-rica-10-pcs",
    description: "Cireng mentahan siap goreng isi daging paru pedas nampol aroma daun jeruk (10 pcs)",
    price: 40000,
    imageUrl: "/images/cireng-paru-rica.webp",
    isAvailable: true,
    sortOrder: 7,
    variants: [
      { id: "var_m_3", name: "Pedas Nampol", price: 0 },
      { id: "var_m_4", name: "Extra Daun Jeruk", price: 0 },
    ],
  },
  {
    id: "prod_mentah_3",
    name: "Cireng Mentah - Isi Keju (10 pcs)",
    slug: "cireng-mentah-isi-keju-10-pcs",
    description: "Cireng mentahan siap goreng isi keju cheddar melimpah gurih nikmat (10 pcs)",
    price: 40000,
    imageUrl: "/images/cireng-keju.webp",
    isAvailable: true,
    sortOrder: 8,
    variants: [
      { id: "var_m_5", name: "Original Gurih", price: 0 },
      { id: "var_m_6", name: "Pedas Keju", price: 0 },
    ],
  },
  {
    id: "prod_mentah_4",
    name: "Cireng Mentah - Ayam Rica (10 pcs)",
    slug: "cireng-mentah-ayam-rica-10-pcs",
    description: "Cireng mentahan siap goreng isi ayam suwir pedas gurih bumbu rempah spesial (10 pcs)",
    price: 40000,
    imageUrl: "/images/cireng-ayam-rica.webp",
    isAvailable: true,
    sortOrder: 9,
    variants: [
      { id: "var_m_7", name: "Pedas Sedang", price: 0 },
      { id: "var_m_8", name: "Extra Pedas", price: 0 },
    ],
  },
  {
    id: "prod_mentah_5",
    name: "Cireng Mentah - Mix Rasa (10 pcs)",
    slug: "cireng-mentah-mix-rasa-10-pcs",
    description: "Cireng mentahan siap goreng mix aneka varian rasa favorit pilihan keluarga (10 pcs)",
    price: 40000,
    imageUrl: "/images/paket-cireng.webp",
    isAvailable: true,
    sortOrder: 10,
    variants: [
      { id: "var_m_9", name: "Mix Komplit", price: 0 },
      { id: "var_m_10", name: "Mix Request di Catatan", price: 0 },
    ],
  },
  {
    id: "prod_mentah_6",
    name: "Cireng Mentah - Pizza (10 pcs)",
    slug: "cireng-mentah-pizza-10-pcs",
    description: "Cireng mentahan siap goreng isi potongan sosis dengan sauce bolognese khas resto (10 pcs)",
    price: 40000,
    imageUrl: "/images/cireng-pizza.webp",
    isAvailable: true,
    sortOrder: 11,
    variants: [
      { id: "var_m_11", name: "Original Bolognese", price: 0 },
      { id: "var_m_12", name: "Extra Keju", price: 0 },
    ],
  },
];

export const INITIAL_PACKAGES: PackageItem[] = [
  {
    id: "pkg_1",
    name: "Paket A",
    slug: "paket-a",
    description: "3 PCS CIRENG BEBAS PILIH",
    price: 10000,
    imageUrl: "/images/paket-cireng.webp",
    packageItems: [
      "3 PCS Cireng Bebas Pilih",
      "Termasuk Creamy Ranch Sauce",
      "*Tambah Rp1.000 jika memilih varian Sapi Teriyaki",
    ],
    includedSauces: ["Creamy Ranch", "Taichan", "Kuah Rujak"],
    isAvailable: true,
    sortOrder: 1,
  },
  {
    id: "pkg_2",
    name: "Paket B",
    slug: "paket-b",
    description: "5 PCS CIRENG BEBAS PILIH",
    price: 15000,
    imageUrl: "/images/paket-cireng.webp",
    packageItems: [
      "5 PCS Cireng Bebas Pilih",
      "Termasuk Creamy Ranch Sauce",
      "*Tambah Rp1.000 jika memilih varian Sapi Teriyaki",
    ],
    includedSauces: ["Creamy Ranch", "Taichan", "Kuah Rujak"],
    isAvailable: true,
    sortOrder: 2,
  },
  {
    id: "pkg_3",
    name: "Paket C",
    slug: "paket-c",
    description: "10 PCS CIRENG BEBAS PILIH",
    price: 30000,
    imageUrl: "/images/paket-cireng.webp",
    packageItems: [
      "10 PCS Cireng Bebas Pilih",
      "Termasuk Creamy Ranch Sauce",
      "*Tambah Rp1.000 jika memilih varian Sapi Teriyaki",
    ],
    includedSauces: ["Creamy Ranch", "Taichan", "Kuah Rujak"],
    isAvailable: true,
    sortOrder: 3,
  },
];

export const INITIAL_ADDONS: AddOnItem[] = [
  {
    id: "addon_1",
    name: "Creamy Ranch",
    description: "Saus Creamy Ranch khas Ciyeng Mamim",
    price: 3000,
    isAvailable: true,
    sortOrder: 1,
  },
  {
    id: "addon_2",
    name: "Taichan",
    description: "Sambal Taichan pedas segar",
    price: 4000,
    isAvailable: true,
    sortOrder: 2,
  },
  {
    id: "addon_3",
    name: "Keju",
    description: "Saus Keju gurih",
    price: 4000,
    isAvailable: true,
    sortOrder: 3,
  },
  {
    id: "addon_4",
    name: "Kuah Rujak",
    description: "Kuah Rujak manis pedas",
    price: 3000,
    isAvailable: true,
    sortOrder: 4,
  },
];
