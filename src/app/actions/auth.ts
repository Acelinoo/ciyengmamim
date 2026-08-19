"use server";

import { AdminLoginSchema, ChangePasswordSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { db } from "@/lib/db";
import { compare, hash } from "bcrypt-ts";
import {
  createSessionToken,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  requireAdminSession,
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
 * 🔒 Server Action: Change Admin Password
 */
export async function changeAdminPasswordAction(rawData: unknown): Promise<AuthActionResult> {
  try {
    const session = await requireAdminSession();
    const parsed = ChangePasswordSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Data formulir tidak valid.",
      };
    }

    const { currentPassword, newPassword } = parsed.data;

    // 1. Verifikasi Password Saat Ini
    const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@ciyengmamim.com").toLowerCase();
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin_ciyeng_mamim_2026!";

    let adminUser = null;
    try {
      adminUser = await db.adminUser.findUnique({
        where: { email: session.email.toLowerCase() },
      });
    } catch {
      // ignore
    }

    let isCurrentPasswordValid = false;

    if (adminUser) {
      isCurrentPasswordValid = await compare(currentPassword, adminUser.password);
    }

    if (!isCurrentPasswordValid && session.email.toLowerCase() === defaultAdminEmail && currentPassword === defaultAdminPassword) {
      isCurrentPasswordValid = true;
    }

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: "Kata sandi lama yang Anda masukkan tidak sesuai.",
      };
    }

    // 2. Hash Password Baru
    const newHashedPassword = await hash(newPassword, 10);

    // 3. Simpan ke Database
    try {
      if (adminUser) {
        await db.adminUser.update({
          where: { id: adminUser.id },
          data: { password: newHashedPassword },
        });
      } else {
        await db.adminUser.create({
          data: {
            email: session.email.toLowerCase(),
            name: session.name || "Admin Ciyeng Mamim",
            password: newHashedPassword,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Update password in DB warning:", dbErr);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Change password error:", error);
    const msg = error instanceof Error ? error.message : "Gagal mengubah kata sandi.";
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * 🔒 Server Action: Admin Logout
 */
export async function adminLogoutAction(): Promise<void> {
  await clearAdminSessionCookie();
}
