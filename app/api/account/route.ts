import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [orders, promos] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, status: true, total: true, shippingMethod: true,
        shippingCost: true, items: true, createdAt: true, promoCode: true,
      },
    }),
    prisma.promoCode.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: { createdAt: "desc" },
      select: { code: true, discountPct: true, validUntil: true, timesUsed: true, usageLimit: true },
    }),
  ]);

  return NextResponse.json({ orders, promos });
}
