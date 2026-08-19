import { getPublicStoreData } from "@/lib/store-data";
import { PaymentManagerClient } from "./PaymentManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentPage() {
  const data = await getPublicStoreData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#16253D] font-display">Pengaturan Pembayaran</h1>
        <p className="text-xs sm:text-sm text-[#4B5E7A] mt-1">
          Atur rekening transfer bank, QRIS dinamis, dan metode bayar di tempat (COD).
        </p>
      </div>

      <PaymentManagerClient initialPayment={data.payment} />
    </div>
  );
}
