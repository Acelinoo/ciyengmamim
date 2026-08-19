import { normalizePhoneNumber } from "@/lib/security/sanitize";

export interface WhatsAppMessageProps {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string;
  paymentMethodName: string;
  paymentProofUrl: string;
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
  storeWhatsappNumber: string;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Merangkai template teks WhatsApp pesanan resmi dengan data terverifikasi server
 */
export function buildWhatsAppOrderMessage(props: WhatsAppMessageProps): string {
  const itemsText = props.items
    .map((item) => {
      let detail = `• ${item.quantity}x ${item.name} (@${formatRupiah(item.unitPrice)})`;
      if (item.variantName) {
        detail += `\n   + Varian: ${item.variantName}`;
      }
      if (item.includedSauces && item.includedSauces.length > 0) {
        item.includedSauces.forEach((sauce) => {
          detail += `\n   + Pilihan Saus: ${sauce}`;
        });
      }
      if (item.extraAddons && item.extraAddons.length > 0) {
        item.extraAddons.forEach((addon) => {
          detail += `\n   + Ekstra Saus: ${addon.name} (${formatRupiah(addon.price)})`;
        });
      }
      return detail;
    })
    .join("\n\n");

  const notesText = props.customerNotes?.trim()
    ? props.customerNotes.trim()
    : "Tidak ada catatan khusus.";

  return `Halo Ciyeng Mamim, saya ingin memesan:

━━━━━━━━━━━━━━━━━━━━
📋 DATA PEMESAN
━━━━━━━━━━━━━━━━━━━━
Nama: ${props.customerName}
No. WhatsApp: ${props.customerPhone}
Alamat / Info Pengantaran:
${props.customerAddress}

━━━━━━━━━━━━━━━━━━━━
🛒 DETAIL PESANAN
━━━━━━━━━━━━━━━━━━━━
${itemsText}

Catatan Khusus:
${notesText}

━━━━━━━━━━━━━━━━━━━━
💰 TOTAL & PEMBAYARAN
━━━━━━━━━━━━━━━━━━━━
Total Pembayaran: ${formatRupiah(props.totalPrice)}
Metode Pembayaran: ${props.paymentMethodName}

Bukti Pembayaran (Private Signed Link):
${props.paymentProofUrl}

⚠️ Catatan: Pesanan akan diproses setelah bukti pembayaran diverifikasi oleh Admin.

Terima kasih! Mohon segera diproses ya kak 🙏✨`;
}

/**
 * Menghasilkan link tautan WhatsApp (wa.me)
 */
export function generateWhatsAppDeepLink(
  storePhone: string,
  message: string
): string {
  const cleanPhone = normalizePhoneNumber(storePhone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
