import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

/**
 * Mercado Pago webhook.
 * Responde 200 ANTES de procesar — evita timeouts de MP (5s).
 * El procesamiento continúa en background (Vercel Node.js runtime).
 */
export async function POST(req: Request) {
  let paymentId: string | undefined;

  try {
    const body = await req.json();
    if (body?.type === "payment" && body?.data?.id) {
      paymentId = String(body.data.id);
    }
  } catch {
    // body inválido, ignorar
  }

  // Responder 200 a MP INMEDIATAMENTE — sin esperar ningún procesamiento
  if (paymentId) {
    // fire-and-forget: Vercel mantiene la función viva hasta que termine
    void processPayment(paymentId);
  }

  return NextResponse.json({ received: true });
}

async function processPayment(paymentId: string): Promise<void> {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("[MP Webhook] MP_ACCESS_TOKEN no configurado");
      return;
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentApi = new Payment(client);

    let payment;
    try {
      payment = await paymentApi.get({ id: paymentId });
    } catch (err) {
      console.error(`[MP Webhook] Error al obtener payment ${paymentId}:`, err);
      return;
    }

    const externalRef = payment.external_reference;
    if (!externalRef) return;

    const statusMap: Record<string, "APPROVED" | "REJECTED" | "CANCELLED" | "PENDING"> = {
      approved:   "APPROVED",
      rejected:   "REJECTED",
      cancelled:  "CANCELLED",
      refunded:   "CANCELLED",
      pending:    "PENDING",
      in_process: "PENDING",
      authorized: "PENDING",
    };
    const newStatus = statusMap[payment.status ?? ""] ?? "PENDING";

    const existingOrder = await prisma.order.findUnique({
      where: { mpExternalRef: externalRef },
      select: { id: true, status: true },
    });

    if (!existingOrder) {
      console.error(`[MP Webhook] Order no encontrada: mpExternalRef=${externalRef}`);
      return;
    }

    const order = await prisma.order.update({
      where: { mpExternalRef: externalRef },
      data: {
        status: newStatus,
        mpPaymentId: String(payment.id),
        payerEmail: payment.payer?.email ?? null,
        payerName: [payment.payer?.first_name, payment.payer?.last_name]
          .filter(Boolean).join(" ") || null,
      },
    });

    if (existingOrder.status !== newStatus) {
      await prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: newStatus },
      });
    }

    if (newStatus === "APPROVED") {
      await issueLoyaltyPromoIfNeeded(order.id);
      await notifyWhatsApp(order);
    }

    console.log(`[MP Webhook] OK payment=${paymentId} → ${newStatus} order=${order.id.slice(0, 8)}`);
  } catch (error) {
    console.error("[MP Webhook] Error en processPayment:", error);
  }
}

async function notifyWhatsApp(order: {
  id: string;
  mpPaymentId: string | null;
  total: number;
  promoCode: string | null;
  promoDiscount: number;
  payerName: string | null;
  payerEmail: string | null;
  items: unknown;
}) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!whatsapp) return;

  // Serializar items del pedido
  type OrderItem = { name?: string; quantity?: number; variantColorName?: string };
  const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
  const itemLines = items
    .map((i) => `• ${i.quantity ?? 1}x ${i.name ?? "Producto"}${i.variantColorName ? ` (${i.variantColorName})` : ""}`)
    .join("\n");

  const promoLine = order.promoCode
    ? `\n🏷 Promo: ${order.promoCode} (-${order.promoDiscount}%)`
    : "";

  const message = [
    "✅ *NUEVO PEDIDO APROBADO — 3DMORE*",
    "",
    `📦 Pedido: \`${order.id.slice(0, 8)}\``,
    `💳 Pago MP: \`${order.mpPaymentId}\``,
    "",
    "*Productos:*",
    itemLines,
    promoLine,
    "",
    `💰 *Total: $${order.total.toFixed(0)} UYU*`,
    order.payerName ? `👤 ${order.payerName}` : "",
    order.payerEmail ? `📧 ${order.payerEmail}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");

  const url = `https://api.whatsapp.com/send?phone=${whatsapp}&text=${encodeURIComponent(message)}`;

  // Usar la API de WhatsApp Business si está configurada, si no solo loguear la URL
  console.log("[MP Webhook] Pedido aprobado — notificación WhatsApp:", url);

  // Si tenés WhatsApp Business API configurada, enviar acá:
  // await fetch("https://api.whatsapp.com/...", { ... });
}

/**
 * Emite un código promocional de fidelidad para el cliente tras
 * una compra aprobada. El código es único por cliente y da 10% OFF
 * durante los próximos 3 meses.
 */
async function issueLoyaltyPromoIfNeeded(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, loyaltyPromoIssued: true, customerFirstName: true },
  });
  if (!order?.userId || order.loyaltyPromoIssued) return;

  // Generar código único tipo VIP-XXXXXXXX
  const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  const code = `VIP-${suffix}`;

  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + 3);

  try {
    await prisma.promoCode.create({
      data: {
        code,
        discountPct: 10,
        isActive: true,
        validUntil,
        userId: order.userId,
        usageLimit: 1,
      },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { loyaltyPromoIssued: true },
    });
    console.log(`[Loyalty] Emitido ${code} para user ${order.userId}`);
  } catch (err) {
    console.error("[Loyalty] Error al emitir promo:", err);
  }
}

