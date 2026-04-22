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
      reviewShowImage: true,
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

export async function PATCH(req: Request) {
  const session = await getIronSession<AdminSessionData>(await cookies(), getAdminSessionOptions());
  if (!session.isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, reviewShowImage } = await req.json();
  if (!id || typeof reviewShowImage !== "boolean") {
    return NextResponse.json({ error: "id y reviewShowImage requeridos" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { reviewShowImage },
    select: { id: true, reviewShowImage: true },
  });

  return NextResponse.json(updated);
}

