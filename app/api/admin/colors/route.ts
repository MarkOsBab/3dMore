import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const colors = await prisma.color.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(colors);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = (body.name ?? "").trim();
  const hex  = (body.hex  ?? "").trim().toLowerCase();

  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  if (!/^#[0-9a-f]{6}$/.test(hex)) {
    return NextResponse.json({ error: "Hex inválido (usá #rrggbb)" }, { status: 400 });
  }

  try {
    const color = await prisma.color.create({
      data: {
        name,
        hex,
        isActive:  body.isActive  ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(color);
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Ese nombre ya existe" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // reorder: body = { ids: string[] }
  const body = await req.json();
  if (!Array.isArray(body.ids)) {
    return NextResponse.json({ error: "ids array requerido" }, { status: 400 });
  }
  await prisma.$transaction(
    body.ids.map((id: string, idx: number) =>
      prisma.color.update({ where: { id }, data: { sortOrder: idx } }),
    ),
  );
  return NextResponse.json({ ok: true });
}
