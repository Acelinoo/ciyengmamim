import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AdminSessionUser } from "@/types";

const AUTH_COOKIE_NAME = "__Secure-authjs.session-token";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "ciyengmamim_super_secure_jwt_secret_key_2026_x89f412"
);

/**
 * Membuat JWT Session Token terenkripsi untuk Admin
 */
export async function createSessionToken(user: AdminSessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

/**
 * Memverifikasi dan decode JWT Session Token
 */
export async function verifySessionToken(token: string): Promise<AdminSessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (!payload || payload.role !== "ADMIN") return null;

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: "ADMIN",
    };
  } catch {
    return null;
  }
}

/**
 * Menyimpan Session Token ke HttpOnly Secure Cookie
 */
export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 hari
  });
}

/**
 * Menghapus Cookie Session saat Logout
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Mengambil session user yang sedang aktif
 */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * 🔒 Mandatory Server-Side Authorization Guard Helper
 * Dipanggil di setiap Server Action / Mutation Admin untuk mencegah akses tanpa hak
 */
export async function requireAdminSession(): Promise<AdminSessionUser> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED: Akses ditolak. Anda harus login sebagai admin.");
  }
  return session;
}
