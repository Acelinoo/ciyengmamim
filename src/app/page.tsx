import { getPublicStoreData } from "@/lib/store-data";
import { calculateOperationalStatus } from "@/lib/operational";
import { StoreClientView } from "@/components/public/StoreClientView";
import { Metadata } from "next";

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const { store } = await getPublicStoreData();
  return {
    title: `${store.storeName} — Cireng Crispy Renyah & Aneka Saus Spesial`,
    description:
      store.tagline ||
      "Pesan Cireng Crispy Ciyeng Mamim online dengan aneka saus lezat: Taichan Pedas, Creamy Ranch, & Cheese. Pesan instan via WhatsApp!",
    openGraph: {
      title: `${store.storeName} — Cireng Crispy & Saus Spesial`,
      description: "Pemesanan instan cireng renyah fresh via WhatsApp.",
      type: "website",
    },
  };
}

export default async function HomePage() {
  const data = await getPublicStoreData();
  const operationalStatus = calculateOperationalStatus(data.operational);

  return (
    <StoreClientView
      store={data.store}
      operational={data.operational}
      payment={data.payment}
      products={data.products}
      packages={data.packages}
      addons={data.addons}
      operationalStatus={operationalStatus}
    />
  );
}
