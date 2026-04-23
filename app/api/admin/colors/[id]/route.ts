import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string")      data.name = body.name.trim();
  if (typeof body.hex === "string") {
    const hex = body.hex.trim().toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(hex)) {
      return NextResponse.json({ error: "Hex inválido" }, { status: 400 });
    }
    data.hex = hex;
  }
  if (typeof body.isActive  === "boolean") data.isActive  = body.isActive;
  if (typeof body.sortOrder === "number")  data.sortOrder = body.sortOrder;

  try {
    const color = await prisma.color.update({ where: { id }, data });
    return NextResponse.json(color);
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
    await prisma.color.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se puede eliminar (en uso)" }, { status: 409 });
  }
}
