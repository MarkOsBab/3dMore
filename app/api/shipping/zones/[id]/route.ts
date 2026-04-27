import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const zone = await prisma.shippingZone.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(body.cost !== undefined && { cost: Number(body.cost) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
      ...(body.isMeetingPoint !== undefined && {
        isMeetingPoint: body.isMeetingPoint === null ? null : Boolean(body.isMeetingPoint),
      }),
      ...(body.meetingPointName !== undefined && {
        meetingPointName:
          typeof body.meetingPointName === "string" && body.meetingPointName.trim() !== ""
            ? body.meetingPointName.trim()
            : null,
      }),
    },
  });
  return NextResponse.json(zone);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.shippingZone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
