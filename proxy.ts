import { type NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { updateSession } from "@/utils/supabase/middleware";
import { adminSessionOptions, type AdminSessionData } from "@/lib/adminSession";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Protección del panel admin ────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // La página de login y su API nunca se protegen (evita loop)
    if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")) {
      return NextResponse.next();
    }

    const res = NextResponse.next();
    const session = await getIronSession<AdminSessionData>(req, res, adminSessionOptions);

    if (!session.isAdmin) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }

    return res;
  }

  // ── Supabase session refresh para el resto ────────────────────────────────
  return updateSession(req);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
