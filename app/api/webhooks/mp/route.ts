import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmedBuyer, sendOrderConfirmedAdmin } from "@/lib/email";

export const maxDuration = 30;

const STATUS_MAP: Record<string, "APPROVED" | "REJECTED" | "CANCELLED" | "PENDING"> = {
  approved:   "APPROVED",
  rejected:   "REJECTED",
  cancelled:  "CANCELLED",
  refunded:   "CANCELLED",
  pending:    "PENDING",
  in_process: "PENDING",
  authorized: "PENDING",
};

async function issueLoyaltyPromo(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, loyaltyPromoIssued: true },
    });
    if (!order?.userId || order.loyaltyPromoIssued) return;

    const code = `VIP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3);

    await prisma.promoCode.create({
      data: {
        code,
        discountPct: 10,
        validUntil,
        userId: order.userId,
        isActive: true,
        usageLimit: 1,
      },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { loyaltyPromoIssued: true },
    });
    console.log(`[Loyalty] Emitido ${code} para pedido ${orderId}`);
  } catch (err) {
    console.error("[Loyalty] Error al emitir promo:", err);
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    let paymentId: string | undefined;

    try {
      const body = await req.json();
      if (body?.type === "payment" && body?.data?.id) {
        paymentId = String(body.data.id);
      }
    } catch {
      // body vacío
    }

    if (!paymentId) {
      const qType = url.searchParams.get("type") || url.searchParams.get("topic");
      const qId = url.searchParams.get("data.id") || url.searchParams.get("id");
      if (qType === "payment" && qId) paymentId = qId;
    }

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("[MP Webhook] MP_ACCESS_TOKEN no configurado");
      return NextResponse.json({ received: true });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    let payment: {
      id: number | string;
      status?: string;
      external_reference?: string;
      payer?: { email?: string; first_name?: string; last_name?: string };
    } | null = null;

    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);

      if (!res.ok) {
        console.error(`[MP Webhook] MP API ${res.status} para payment ${paymentId}`);
        return NextResponse.json({ received: true });
      }
      payment = await res.json();
    } catch (err) {
      clearTimeout(timer);
      console.error(`[MP Webhook] Error fetch payment ${paymentId}:`, err);
      return NextResponse.json({ received: true });
    }

    const externalRef = payment?.external_reference;
    if (!payment || !externalRef) {
      return NextResponse.json({ received: true });
    }

    const newStatus = STATUS_MAP[payment.status ?? ""] ?? "PENDING";

    const existing = await prisma.order.findUnique({
      where: { mpExternalRef: externalRef },
      select: {
        id: true,
        status: true,
        total: true,
        items: true,
        shippingMethod: true,
        shippingData: true,
        customerFirstName: true,
        customerLastName: true,
        customerEmail: true,
        customerPhone: true,
      },
    });

    if (!existing) {
      console.error(`[MP Webhook] Order no encontrada: ${externalRef}`);
      return NextResponse.json({ received: true });
    }

    const wasAlreadyApproved = existing.status === "APPROVED";

    await prisma.order.update({
      where: { mpExternalRef: externalRef },
      data: {
        status: newStatus,
        mpPaymentId: String(payment.id),
        payerEmail: payment.payer?.email ?? null,
        payerName: [payment.payer?.first_name, payment.payer?.last_name]
          .filter(Boolean).join(" ") || null,
      },
    });

    if (existing.status !== newStatus) {
      await prisma.orderStatusHistory.create({
        data: { orderId: existing.id, status: newStatus },
      });
    }

    // Notificaciones y promo solo la primera vez que se aprueba
    if (newStatus === "APPROVED" && !wasAlreadyApproved) {
      const orderForEmail = {
        ...existing,
        mpPaymentId: String(payment.id),
        payerEmail: payment.payer?.email ?? null,
        payerName: [payment.payer?.first_name, payment.payer?.last_name]
          .filter(Boolean).join(" ") || null,
      };

      await Promise.allSettled([
        sendOrderConfirmedBuyer(orderForEmail),
        sendOrderConfirmedAdmin(orderForEmail),
        issueLoyaltyPromo(existing.id),
      ]);
    }

    console.log(`[MP Webhook] OK payment=${paymentId} → ${newStatus}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[MP Webhook] Error inesperado:", err);
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
