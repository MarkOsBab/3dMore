import { prisma } from "@/lib/prisma";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <OrdersClient initialOrders={orders as any[]} />;
}
