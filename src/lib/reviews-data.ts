export interface CustomerReview {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  rating: number;
  date: string;
  reviewText: string;
  favoriteItem?: string;
}

export interface GoogleReviewsSummary {
  rating: number;
  maxRating: number;
  label: string;
  placeName: string;
  googleMapsUrl: string;
  totalReviewsText: string;
}

export const GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com/maps/place/Ciyeng+Mamim+(Cireng+isi+PREMIUM)/@-7.022391,107.5423507,17z/data=!4m8!3m7!1s0x2e68ed0069a4a477:0xfe01ca13fc50ae11!8m2!3d-7.022391!4d107.5423507!9m1!1b1!16s%2Fg%2F11zgcxh3wm?entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D";

// Deep Link Google Reviews: Membuka langsung popup form bintang & penulisan ulasan Google (pola #lrd=0x2e68ed0069a4a477:0xfe01ca13fc50ae11,3)
export const GOOGLE_REVIEWS_WRITE_URL =
  "https://www.google.com/search?hl=id-ID&gl=id&q=Ciyeng+Mamim+%28Cireng+isi+PREMIUM%29,+Soreang,+Kabupaten+Bandung,+Jawa+Barat&ludocid=18303132547796741649#lrd=0x2e68ed0069a4a477:0xfe01ca13fc50ae11,3";

export const GOOGLE_MAPS_REVIEW_URL = GOOGLE_REVIEWS_WRITE_URL;

export const GOOGLE_REVIEWS_SUMMARY: GoogleReviewsSummary = {
  rating: 5.0,
  maxRating: 5.0,
  label: "Google Reviews",
  placeName: "Ciyeng Mamim (Cireng isi PREMIUM)",
  googleMapsUrl: GOOGLE_REVIEWS_WRITE_URL,
  totalReviewsText: "⭐ 5.0 / 5.0 di Google Reviews",
};

export const INITIAL_CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "rev_1",
    name: "Rani Rahmawati",
    initials: "RR",
    avatarBg: "bg-[#16253D]",
    rating: 5,
    date: "2 minggu lalu",
    reviewText:
      "Cireng isi terenak di Soreang! Kulit luarnya beneran renyah crispy tapi dalemnya tetep kenyal lembut. Isian ayam ricanya melimpah dan bumbu pedasnya gurih nampol. Saus Creamy Ranch-nya kombinasi yang pas banget!",
    favoriteItem: "Ayam Rica & Creamy Ranch",
  },
  {
    id: "rev_2",
    name: "Dimas Prasetyo",
    initials: "DP",
    avatarBg: "bg-[#5C4028]",
    rating: 5,
    date: "1 bulan lalu",
    reviewText:
      "Beli Paket 10 pcs buat camilan sore di kantor, langsung ludes! Favorit saya rasa Sapi Teriyaki sama Paru Rica. Cireng digoreng dadakan jadi pas nyampe masih anget renyah. Pasti langganan terus.",
    favoriteItem: "Paket 10 Pcs & Sapi Teriyaki",
  },
  {
    id: "rev_3",
    name: "Siti Nurhaliza",
    initials: "SN",
    avatarBg: "bg-[#B91C1C]",
    rating: 5,
    date: "3 minggu lalu",
    reviewText:
      "Anak-anak suka banget sama varian Kejunya, gurih dan nggak pelit isian. Harganya sangat terjangkau untuk cireng isi kualitas premium. Pelayanan ramah dan pesanan via WhatsApp cepet direspons.",
    favoriteItem: "Cireng Keju Cheddar",
  },
  {
    id: "rev_4",
    name: "Fajar Nugraha",
    initials: "FN",
    avatarBg: "bg-[#1D2D44]",
    rating: 5,
    date: "1 bulan lalu",
    reviewText:
      "Sensasi makan cireng cocol Creamy Ranch beneran berasa makan di resto! Saus Taichannya juga seger pedes asem mantap. Pas banget buat teman nongkrong di Soreang.",
    favoriteItem: "Cireng Pizza & Sambal Taichan",
  },
];
