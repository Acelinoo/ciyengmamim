import { OperationalSettingsType } from "@/types";

export interface LiveOperationalStatus {
  isOpen: boolean;
  statusText: string;
  badgeColor: "green" | "amber" | "rose";
  message: string;
  nextScheduleInfo: string;
}

const INDONESIAN_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

/**
 * Menghitung status buka/tutup toko secara real-time berdasarkan zona waktu WIB (UTC+7)
 */
export function calculateOperationalStatus(
  settings?: OperationalSettingsType | null
): LiveOperationalStatus {
  if (!settings) {
    return {
      isOpen: true,
      statusText: "BUKA",
      badgeColor: "green",
      message: "Toko sedang buka • Melayani pesanan sekarang",
      nextScheduleInfo: "Buka setiap hari 10:00 - 21:00 WIB",
    };
  }

  // 1. Cek Master Manual Override
  if (!settings.isStoreOpen) {
    return {
      isOpen: false,
      statusText: "TUTUP",
      badgeColor: "amber",
      message:
        settings.closedMessage ||
        "Toko sedang tutup sementara oleh admin.",
      nextScheduleInfo: `Jam operasional normal: ${settings.openTime} - ${settings.closeTime} WIB`,
    };
  }

  // 2. Jika autoSchedule dimatikan, toko dianggap selalu buka
  if (!settings.autoSchedule) {
    return {
      isOpen: true,
      statusText: "BUKA",
      badgeColor: "green",
      message: "Toko sedang buka • Melayani pesanan sekarang",
      nextScheduleInfo: "Melayani pesanan online",
    };
  }

  // 3. Konversi waktu sekarang ke Zona Waktu WIB (Asia/Jakarta, UTC+7)
  const now = new Date();
  const wibString = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const wibDate = new Date(wibString);

  const dayIndex = wibDate.getDay();
  const currentDayName = INDONESIAN_DAYS[dayIndex];

  // 4. Cek apakah hari ini hari libur
  if (settings.closedDays && settings.closedDays.includes(currentDayName)) {
    return {
      isOpen: false,
      statusText: "LIBUR",
      badgeColor: "rose",
      message: `Hari ini (${currentDayName}) toko libur. Kami buka kembali besok!`,
      nextScheduleInfo: `Buka kembali di hari kerja: ${settings.openTime} - ${settings.closeTime} WIB`,
    };
  }

  // 5. Cek Jam Operasional
  const currentHour = wibDate.getHours();
  const currentMinute = wibDate.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const [openHour, openMin] = settings.openTime.split(":").map(Number);
  const [closeHour, closeMin] = settings.closeTime.split(":").map(Number);

  const openTotalMinutes = openHour * 60 + openMin;
  const closeTotalMinutes = closeHour * 60 + closeMin;

  if (
    currentTotalMinutes >= openTotalMinutes &&
    currentTotalMinutes < closeTotalMinutes
  ) {
    return {
      isOpen: true,
      statusText: "BUKA",
      badgeColor: "green",
      message: `Toko sedang buka • Melayani pesanan hingga pukul ${settings.closeTime} WIB`,
      nextScheduleInfo: `Buka hari ini: ${settings.openTime} - ${settings.closeTime} WIB`,
    };
  }

  return {
    isOpen: false,
    statusText: "TUTUP",
    badgeColor: "amber",
    message: `Toko sedang tutup. Buka kembali pukul ${settings.openTime} WIB.`,
    nextScheduleInfo: `Jam operasional: ${settings.openTime} - ${settings.closeTime} WIB`,
  };
}
