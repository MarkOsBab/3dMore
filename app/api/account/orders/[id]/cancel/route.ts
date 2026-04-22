import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, userId: true },
  });

  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  if (order.userId !== user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Solo podés cancelar un pedido que esté pendiente de confirmación" },
      { status: 422 }
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
