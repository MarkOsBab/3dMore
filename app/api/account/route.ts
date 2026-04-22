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
      take: 50,
      select: {
        id: true,
        status: true,
        subtotal: true,
        total: true,
        promoCode: true,
        promoDiscount: true,
        shippingMethod: true,
        shippingCost: true,
        shippingData: true,
        items: true,
        createdAt: true,
        updatedAt: true,
        mpPaymentId: true,
        customerFirstName: true,
        customerLastName: true,
        customerPhone: true,
        customerEmail: true,
        reviewRating: true,
        reviewText: true,
        reviewImageUrl: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
          select: { status: true, createdAt: true },
        },
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
