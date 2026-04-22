import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { getAdminSessionOptions, type AdminSessionData } from "@/lib/adminSession";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length === 0 ||
    password.length === 0
  ) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 400 });
  }

  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;

  // Comparación en tiempo constante para evitar timing attacks
  const userMatch = timingSafeEqual(username, validUser ?? "");
  const passMatch = timingSafeEqual(password, validPass ?? "");

  if (!userMatch || !passMatch) {
    // Pequeño delay para dificultar brute-force
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const session = await getIronSession<AdminSessionData>(await cookies(), getAdminSessionOptions());
  session.isAdmin = true;
  await session.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getIronSession<AdminSessionData>(await cookies(), getAdminSessionOptions());
  session.destroy();
  return NextResponse.json({ ok: true });
}

/** Comparación en tiempo constante (evita timing attacks sobre strings) */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Igual cantidad de iteraciones para no filtrar longitud
    let r = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0);
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
