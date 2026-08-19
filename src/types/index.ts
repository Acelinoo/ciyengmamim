export type ProductType = "PRODUCT" | "PACKAGE";

export interface VariantOptionType {
  id: string;
  name: string;
  price: number;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  sortOrder: number;
  variants?: VariantOptionType[];
}

export interface PackageItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  packageItems: string[];
  includedSauces: string[];
  isAvailable: boolean;
  sortOrder: number;
}

export interface AddOnItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface StoreSettingsType {
  id: string;
  storeName: string;
  tagline: string | null;
  logoUrl: string | null;
  whatsappNumber: string;
  instagramHandle: string | null;
  instagramUrl: string | null;
  address: string | null;
  mapsUrl: string | null;
  mapsEmbedUrl: string | null;
}

export interface OperationalSettingsType {
  id: string;
  isStoreOpen: boolean;
  autoSchedule: boolean;
  openTime: string; // e.g. "10:00"
  closeTime: string; // e.g. "21:00"
  closedDays: string[]; // e.g. ["Senin"]
  closedMessage: string | null;
}

export interface PaymentSettingsType {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankNotes: string | null;
  qrisImageUrl: string | null;
  qrisNmid: string | null;
  isQrisActive: boolean;
  isBankActive: boolean;
}

// Client Shopping Cart Item
export interface CartItem {
  cartItemId: string; // Unique key for cart row
  id: string; // Product or Package ID
  type: ProductType;
  name: string;
  price: number; // Unit price from client cache (will be re-verified on server)
  imageUrl: string;
  quantity: number;
  selectedVariant?: VariantOptionType;
  selectedSauces?: string[]; // For Packages
  extraAddons?: {
    id: string;
    name: string;
    price: number;
  }[];
}

// Payload sent from Client to Server for Checkout (Only IDs & quantities)
export interface CheckoutPayload {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string;
  paymentMethod: "BANK_TRANSFER" | "QRIS";
  paymentProofToken: string;
  appOrigin?: string;
  items: {
    cartItemId: string;
    id: string;
    type: ProductType;
    quantity: number;
    variantId?: string;
    selectedSauces?: string[];
    addonIds?: string[];
  }[];
}

// Server Verified Order Result
export interface VerifiedOrderResult {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes: string;
  paymentMethodName: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    variantName?: string;
    includedSauces?: string[];
    extraAddons?: { name: string; price: number }[];
  }[];
  totalPrice: number;
  paymentProofUrl: string;
  whatsappMessage: string;
  whatsappUrl: string;
}

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
}
