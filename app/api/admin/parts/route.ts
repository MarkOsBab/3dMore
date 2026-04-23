import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET ?productId=xxx — list parts for a product
export async function GET(req: Request) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId requerido" }, { status: 400 });

  const parts = await prisma.productPart.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { defaultColor: true },
  });
  return NextResponse.json(parts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { productId, name, modelUrl, format } = body;

  if (!productId || !name || !modelUrl || !format) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const count = await prisma.productPart.count({ where: { productId } });

  const part = await prisma.productPart.create({
    data: {
      productId,
      name: String(name).trim(),
      modelUrl: String(modelUrl),
      format: String(format),
      positionX: body.positionX ?? 0,
      positionY: body.positionY ?? 0,
      positionZ: body.positionZ ?? 0,
      rotationX: body.rotationX ?? 0,
      rotationY: body.rotationY ?? 0,
      rotationZ: body.rotationZ ?? 0,
      scale:          body.scale          ?? 1,
      defaultColorId: body.defaultColorId ?? null,
      sortOrder:      count,
    },
    include: { defaultColor: true },
  });
  return NextResponse.json(part);
}

// PUT — reorder: { ids: string[] }
export async function PUT(req: Request) {
  const body = await req.json();
  if (!Array.isArray(body.ids)) {
    return NextResponse.json({ error: "ids array requerido" }, { status: 400 });
  }
  await prisma.$transaction(
    body.ids.map((id: string, idx: number) =>
      prisma.productPart.update({ where: { id }, data: { sortOrder: idx } }),
    ),
  );
  return NextResponse.json({ ok: true });
}
