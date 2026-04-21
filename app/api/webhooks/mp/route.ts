import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

/**
 * Mercado Pago webhook — recibe notificaciones de pago.
 * Configurar en el panel de MP: Desarrolladores → Webhooks
 * URL: https://tu-dominio.com/api/webhooks/mp
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type !== "payment" || !data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentApi = new Payment(client);
    const payment = await paymentApi.get({ id: data.id });

    const externalRef = payment.external_reference;
    if (!externalRef) {
      return NextResponse.json({ received: true });
    }

    // Mapa de status MP → OrderStatus
    const statusMap: Record<string, "APPROVED" | "REJECTED" | "CANCELLED" | "PENDING"> = {
      approved:    "APPROVED",
      rejected:    "REJECTED",
      cancelled:   "CANCELLED",
      refunded:    "CANCELLED",
      pending:     "PENDING",
      in_process:  "PENDING",
      authorized:  "PENDING",
    };

    const newStatus = statusMap[payment.status ?? ""] ?? "PENDING";

    // Actualizar el Order en BD
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

    // Solo notificar por WhatsApp cuando se aprueba
    if (newStatus === "APPROVED") {
      await notifyWhatsApp(order);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[MP Webhook] Error:", error);
    return NextResponse.json({ received: true });
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

