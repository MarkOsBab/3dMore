import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(req: NextRequest) {
  // ── Basic Auth para /admin ────────────────────────────────────────────────
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const basicAuth = req.headers.get("authorization");

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      if (
        user === process.env.ADMIN_USERNAME &&
        pwd === process.env.ADMIN_PASSWORD
      ) {
        return updateSession(req);
      }
    }

    return new NextResponse("Autenticación Requerida", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="3dMore Admin"' },
    });
  }

  // ── Supabase session refresh para el resto ────────────────────────────────
  return updateSession(req);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
