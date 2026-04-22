import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = await prisma.order.findMany({
    where: {
      reviewRating: { gte: 4 },
      status: "DELIVERED",
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      reviewRating: true,
      reviewText: true,
      reviewImageUrl: true,
      reviewShowImage: true,
      updatedAt: true,
      customerFirstName: true,
      customerLastName: true,
      items: true,
    },
  });

  return NextResponse.json(reviews);
}
