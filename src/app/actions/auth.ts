"use server";

import { AdminLoginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { db } from "@/lib/db";
import { compare } from "bcrypt-ts";
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
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Rate Limiting: Maksimal 15 percobaan per 15 menit
    const rateLimit = checkRateLimit(`admin-login:${cleanEmail}`, {
      limit: 15,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.isAllowed) {
      return {
        success: false,
        error:
          "Terlalu banyak percobaan login. Harap tunggu beberapa menit sebelum mencoba kembali.",
      };
    }

    const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@ciyengmamim.com").toLowerCase();
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin_ciyeng_mamim_2026!";

    // 2. Cek default credentials
    let isValid = false;
    let userId = "default_admin_id";
    let userName = "Admin Ciyeng Mamim";

    if (cleanEmail === defaultAdminEmail && cleanPassword === defaultAdminPassword) {
      isValid = true;
    }

    // 3. Jika bukan default atau mau cek DB jika online
    if (!isValid) {
      try {
        const adminUser = await db.adminUser.findUnique({
          where: { email: cleanEmail },
        });

        if (adminUser) {
          const match = await compare(cleanPassword, adminUser.password);
          if (match) {
            isValid = true;
            userId = adminUser.id;
            userName = adminUser.name;
          }
        }
      } catch (dbErr) {
        console.warn("DB login check warning (fallback to env check):", dbErr);
      }
    }

    if (!isValid) {
      return {
        success: false,
        error: "Email atau kata sandi yang Anda masukkan salah.",
      };
    }

    // 4. Generate JWT & Set HttpOnly Cookie
    const sessionUser: AdminSessionUser = {
      id: userId,
      email: cleanEmail,
      name: userName,
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
