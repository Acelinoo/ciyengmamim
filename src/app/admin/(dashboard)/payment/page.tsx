import { db } from "@/lib/db";
import { INITIAL_PAYMENT_SETTINGS } from "@/lib/mock-data";
import { PaymentManagerClient } from "./PaymentManagerClient";
import { PaymentSettingsType } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminPaymentPage() {
  let payment: PaymentSettingsType;

  try {
    const dbPayment = await db.paymentSettings.findFirst();
    payment = dbPayment || INITIAL_PAYMENT_SETTINGS;
  } catch {
    payment = INITIAL_PAYMENT_SETTINGS;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1E1D1A]">Pengaturan Pembayaran</h1>
        <p className="text-xs sm:text-sm text-[#6B685F] mt-1">
          Atur rekening transfer bank dan upload/ganti gambar QRIS toko.
        </p>
      </div>

      <PaymentManagerClient initialPayment={payment} />
    </div>
  );
}
