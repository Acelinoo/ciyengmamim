import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "__Secure-authjs.session-token";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "ciyengmamim_super_secure_jwt_secret_key_2026_x89f412"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Hanya periksa rute admin
  if (pathname.startsWith("/admin")) {
    // Biarkan akses ke halaman login
    if (pathname === "/admin/login") {
      const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (token) {
        try {
          const { payload } = await jwtVerify(token, SECRET_KEY);
          if (payload && payload.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin/menu", req.url));
          }
        } catch {
          // Token tidak valid, tetap di /admin/login
        }
      }
      return NextResponse.next();
    }

    // Periksa token untuk semua rute /admin/* lainnya
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (!payload || payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
