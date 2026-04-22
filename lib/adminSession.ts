import type { SessionOptions } from "iron-session";

export interface AdminSessionData {
  isAdmin?: boolean;
}

export const adminSessionOptions: SessionOptions = {
  cookieName: "3dmore_admin_session",
  password: process.env.ADMIN_SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 horas
  },
};
