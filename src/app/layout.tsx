import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "600", "700", "800"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Ciyeng Mamim — Cireng Crispy Renyah & Aneka Saus Spesial",
  description:
    "Pesan Cireng Crispy Ciyeng Mamim online dengan aneka pilihan saus spesial: Taichan Pedas, Creamy Ranch, & Cheese. Fresh digoreng dadakan!",
  keywords: [
    "Cireng Crispy",
    "Ciyeng Mamim",
    "Cireng Taichan",
    "Cireng Kuah",
    "Cemilan Enak",
    "Kuliner Cireng Jakarta",
  ],
  authors: [{ name: "Ciyeng Mamim" }],
  creator: "Marchelino Kurniawan (Acelino)",
  openGraph: {
    title: "Ciyeng Mamim — Cireng Crispy & Saus Spesial",
    description: "Pemesanan cireng instan langsung via WhatsApp.",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F3EC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-[#F6F3EC] text-[#16253D]">
        {children}
      </body>
    </html>
  );
}
