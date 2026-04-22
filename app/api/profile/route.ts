import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ profile: null }, { status: 401 });

  let profile = await prisma.userProfile.findUnique({ where: { id: user.id } });

  if (!profile) {
    // Autocrear el profile con datos de Google en el primer login
    const meta = user.user_metadata ?? {};
    profile = await prisma.userProfile.create({
      data: {
        id: user.id,
        email: user.email ?? null,
        firstName: (meta.given_name as string) ?? (meta.name as string)?.split(" ")[0] ?? null,
        lastName: (meta.family_name as string) ?? (meta.name as string)?.split(" ").slice(1).join(" ") ?? null,
        avatarUrl: (meta.avatar_url as string) ?? (meta.picture as string) ?? null,
      },
    });
  }

  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, documentId, phone } = body;

  // Validaciones básicas
  if (!firstName || !lastName || !documentId || !phone) {
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
  }

  const profile = await prisma.userProfile.upsert({
    where: { id: user.id },
    update: {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      documentId: String(documentId).trim(),
      phone: String(phone).trim(),
    },
    create: {
      id: user.id,
      email: user.email ?? null,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      documentId: String(documentId).trim(),
      phone: String(phone).trim(),
    },
  });

  return NextResponse.json({ profile });
}
