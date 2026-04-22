import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  const addresses = await prisma.savedAddress.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { label, street, doorNumber, corner, neighborhood, postalCode, zoneId, zoneName } = body;

  if (!street?.trim() || !doorNumber?.trim() || !neighborhood?.trim() || !zoneId || !zoneName) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const address = await prisma.savedAddress.create({
    data: {
      userId: user.id,
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
  return NextResponse.json(address, { status: 201 });
}
