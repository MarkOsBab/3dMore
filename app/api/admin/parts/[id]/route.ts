import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  const passthrough = [
    "name", "modelUrl", "format",
    "positionX", "positionY", "positionZ",
    "rotationX", "rotationY", "rotationZ",
    "scale", "sortOrder",
  ] as const;

  for (const k of passthrough) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  if (body.defaultColorId !== undefined) {
    data.defaultColorId = body.defaultColorId || null;
  }
  if (typeof data.name === "string") data.name = data.name.trim();

  try {
    const part = await prisma.productPart.update({
      where: { id },
      data,
      include: { defaultColor: true },
    });
    return NextResponse.json(part);
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    await prisma.productPart.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
