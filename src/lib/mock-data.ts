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
  logoUrl: "/images/logo.png",
  whatsappNumber: "6289676636637",
  instagramHandle: "ciyengmamim",
  instagramUrl: "https://instagram.com/ciyengmamim",
  address: "Jl Raya gading tutuka GC Kuliner pujasera, Soreang",
  mapsUrl: "https://maps.google.com/?q=GC+Kuliner+pujasera+Soreang",
  mapsEmbedUrl: null,
};

export const INITIAL_OPERATIONAL_SETTINGS: OperationalSettingsType = {
  id: "default_operational",
  isStoreOpen: true,
  autoSchedule: true,
  openTime: "10:00",
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
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod_1",
    name: "Ayam Rica",
    slug: "ayam-rica",
    description: "Ayam Suir Pedas Gurih Dengan Rempah Pilihan",
    price: 3500,
    imageUrl: "/images/cireng-ayam-rica.jpg",
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
    imageUrl: "/images/cireng-sapi-teriyaki.jpg",
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
    imageUrl: "/images/cireng-paru-rica.jpg",
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
    imageUrl: "/images/cireng-pizza.jpg",
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
    imageUrl: "/images/cireng-keju.jpg",
    isAvailable: true,
    sortOrder: 5,
    variants: [
      { id: "var_9", name: "Original", price: 0 },
      { id: "var_10", name: "Pedas", price: 500 },
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
    imageUrl: "/images/paket-cireng.jpg",
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
    imageUrl: "/images/paket-cireng.jpg",
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
    imageUrl: "/images/paket-cireng.jpg",
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
