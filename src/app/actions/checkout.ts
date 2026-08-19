"use server";

import { CheckoutPayloadSchema } from "@/lib/validations";
import { calculateAndVerifyOrder } from "@/lib/checkout/calculate-order";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { CheckoutPayload } from "@/types";

export interface CheckoutActionResult {
  success: boolean;
  whatsappUrl?: string;
  whatsappMessage?: string;
  totalPrice?: number;
  error?: string;
}

/**
 * 🔒 Server Action: Process Order Checkout
 * Dijalankan saat customer menekan "Kirim Pesanan via WhatsApp"
 */
export async function processCheckoutAction(
  payload: CheckoutPayload
): Promise<CheckoutActionResult> {
  try {
    // 1. Rate Limiting per nomor telepon / IP
    const rateLimit = checkRateLimit(`checkout:${payload.customerPhone}`, {
      limit: 10,
      windowMs: 5 * 60 * 1000, // 10 order dalam 5 menit
    });

    if (!rateLimit.isAllowed) {
      return {
        success: false,
        error:
          "Terlalu banyak permintaan pesanan. Harap tunggu beberapa saat sebelum mencoba kembali.",
      };
    }

    // 2. Validasi input dengan Zod Schema
    const parsed = CheckoutPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Data formulir tidak valid.";
      return {
        success: false,
        error: errorMsg,
      };
    }

    // 3. Kalkulasi & Verifikasi Harga Server-Side (Price Integrity)
    const verifiedOrder = await calculateAndVerifyOrder(parsed.data as CheckoutPayload);

    return {
      success: true,
      whatsappUrl: verifiedOrder.whatsappUrl,
      whatsappMessage: verifiedOrder.whatsappMessage,
      totalPrice: verifiedOrder.totalPrice,
    };
  } catch (error) {
    console.error("Checkout server action error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan saat memproses pesanan.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
