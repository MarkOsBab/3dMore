import type { SessionOptions } from "iron-session";

export interface AdminSessionData {
  isAdmin?: boolean;
}

/** Llamar en cada request — el Edge Runtime expone process.env en runtime, no en module init */
export function getAdminSessionOptions(): SessionOptions {
  const password = process.env.ADMIN_SESSION_SECRET;
  if (!password) throw new Error("ADMIN_SESSION_SECRET no está configurado");
  return {
    cookieName: "3dmore_admin_session",
    password,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
    },
  };
}
