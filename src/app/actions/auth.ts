"use server";

import { AdminLoginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { db } from "@/lib/db";
import { compare, hash } from "bcrypt-ts";
import {
  createSessionToken,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from "@/lib/auth/session";
import { AdminSessionUser } from "@/types";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

/**
 * 🔒 Server Action: Admin Login
 */
export async function adminLoginAction(formData: {
  email?: string;
  password?: string;
}): Promise<AuthActionResult> {
  try {
    const parsed = AdminLoginSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Email atau password tidak valid.",
      };
    }

    const { email, password } = parsed.data;

    // 1. Rate Limiting: Maksimal 5 percobaan gagal per 15 menit per email
    const rateLimit = checkRateLimit(`admin-login:${email.toLowerCase()}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.isAllowed) {
      return {
        success: false,
        error:
          "Terlalu banyak percobaan login gagal. Akun dikunci sementara selama 15 menit demi alasan keamanan.",
      };
    }

    // 2. Cari Admin di Database atau verifikasi default env credentials
    let adminUser = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@ciyengmamim.com").toLowerCase();
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin_ciyeng_mamim_2026!";

    if (!adminUser && email.toLowerCase() === defaultAdminEmail) {
      // Buat user admin default di database jika belum ada
      const hashedPassword = await hash(defaultAdminPassword, 10);
      try {
        adminUser = await db.adminUser.create({
          data: {
            email: defaultAdminEmail,
            name: "Admin Ciyeng Mamim",
            password: hashedPassword,
          },
        });
      } catch {
        // Fallback in-memory
        adminUser = {
          id: "default_admin_id",
          email: defaultAdminEmail,
          name: "Admin Ciyeng Mamim",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    if (!adminUser) {
      return {
        success: false,
        error: "Email atau password yang Anda masukkan salah.",
      };
    }

    // 3. Verifikasi Password Hashing
    let isPasswordValid = false;
    try {
      isPasswordValid = await compare(password, adminUser.password);
    } catch {
      isPasswordValid = false;
    }

    // Fallback jika password cocok dengan default password
    if (!isPasswordValid && password === defaultAdminPassword && email.toLowerCase() === defaultAdminEmail) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Email atau password yang Anda masukkan salah.",
      };
    }

    // 4. Generate JWT & Set HttpOnly Cookie
    const sessionUser: AdminSessionUser = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: "ADMIN",
    };

    const token = await createSessionToken(sessionUser);
    await setAdminSessionCookie(token);

    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return {
      success: false,
      error: "Terjadi kendala saat memproses login. Silakan coba lagi.",
    };
  }
}

/**
 * 🔒 Server Action: Admin Logout
 */
export async function adminLogoutAction(): Promise<void> {
  await clearAdminSessionCookie();
}
