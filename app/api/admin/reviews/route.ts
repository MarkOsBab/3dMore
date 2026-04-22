import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { getAdminSessionOptions, type AdminSessionData } from "@/lib/adminSession";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getIronSession<AdminSessionData>(await cookies(), getAdminSessionOptions());
  if (!session.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const reviews = await prisma.order.findMany({
    where: { reviewRating: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      reviewRating: true,
      reviewText: true,
      reviewImageUrl: true,
      updatedAt: true,
      customerFirstName: true,
      customerLastName: true,
      customerEmail: true,
      payerName: true,
      payerEmail: true,
      items: true,
      total: true,
      status: true,
    },
  });

  return NextResponse.json(reviews);
}
