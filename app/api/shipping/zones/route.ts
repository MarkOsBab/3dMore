import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// Listado público de zonas activas. Con ?all=1 devuelve todas (para admin).
export async function GET(req: Request) {
  const includeAll = new URL(req.url).searchParams.get("all") === "1";
  const zones = await prisma.shippingZone.findMany({
    where: includeAll ? undefined : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(zones);
}

// Crear zona (admin)
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, cost, sortOrder } = body;

  if (!name || typeof cost !== "number") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const zone = await prisma.shippingZone.create({
      data: {
        name: String(name).trim(),
        cost,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
    });
    return NextResponse.json(zone);
  } catch {
    return NextResponse.json({ error: "La zona ya existe" }, { status: 409 });
  }
}
