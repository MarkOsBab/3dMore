import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

async function getOwnedAddress(userId: string, id: string) {
  const address = await prisma.savedAddress.findUnique({ where: { id } });
  if (!address || address.userId !== userId) return null;
  return address;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await getOwnedAddress(user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { label, street, doorNumber, corner, neighborhood, postalCode, zoneId, zoneName } = body;

  if (!street?.trim() || !doorNumber?.trim() || !neighborhood?.trim() || !zoneId || !zoneName) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const updated = await prisma.savedAddress.update({
    where: { id },
    data: {
      label: label?.trim() || null,
      street: String(street).trim(),
      doorNumber: String(doorNumber).trim(),
      corner: corner?.trim() || null,
      neighborhood: String(neighborhood).trim(),
      postalCode: postalCode?.trim() || null,
      zoneId: String(zoneId),
      zoneName: String(zoneName),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await getOwnedAddress(user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.savedAddress.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
