import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { getAdminSessionOptions, type AdminSessionData } from "@/lib/adminSession";
import { cookies } from "next/headers";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:            ["CONFIRMED", "CANCELLED"],
  APPROVED:           ["CONFIRMED", "CANCELLED"],
  CONFIRMED:          ["READY_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED:          [],
  REJECTED:           ["CANCELLED"],
  CANCELLED:          [],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getIronSession<AdminSessionData>(await cookies(), getAdminSessionOptions());
  if (!session.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, trackingCode, trackingCarrier } = body as {
    status?: string;
    trackingCode?: string | null;
    trackingCarrier?: string | null;
  };

  // Modo: actualizar solo tracking (sin transición de estado)
  if (!status && (trackingCode !== undefined || trackingCarrier !== undefined)) {
    const exists = await prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    const code = (trackingCode ?? "").toString().trim();
    const carrier = (trackingCarrier ?? "").toString().trim();
    const updated = await prisma.order.update({
      where: { id },
      data: {
        trackingCode: code === "" ? null : code,
        trackingCarrier: carrier === "" ? null : carrier,
      },
    });
    return NextResponse.json(updated);
  }

  if (!status) {
    return NextResponse.json({ error: "status requerido" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `No se puede pasar de ${order.status} a ${status}` },
      { status: 422 }
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: status as never },
    }),
    prisma.orderStatusHistory.create({
      data: { orderId: id, status: status as never },
    }),
  ]);

  return NextResponse.json(updated);
}
