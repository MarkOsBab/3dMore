import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

type ShippingMethod = "HOME_MVD" | "AGENCY" | "PICKUP";

interface CheckoutBody {
  items: Array<{
    name: string;
    description?: string;
    imageUrl?: string;
    category?: string;
    quantity: number;
    price: number;
    isOffer?: boolean;
    discountPercentage?: number;
  }>;
  promoCode?: string | null;
  promoDiscount?: number;
  shippingMethod: ShippingMethod;
  shippingData: {
    zoneId?: string;
    zoneName?: string;
    address?: string;
    agency?: string;
    notes?: string;
  };
  shippingCost: number;
}

export async function POST(req: Request) {
  try {
    const body: CheckoutBody = await req.json();
    const { items, promoCode, promoDiscount, shippingMethod, shippingData, shippingCost } = body;

    // Validar que el user esté logueado y tenga profile completo
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Debés iniciar sesión" }, { status: 401 });
    }
    const profile = await prisma.userProfile.findUnique({ where: { id: user.id } });
    if (!profile?.firstName || !profile?.lastName || !profile?.documentId || !profile?.phone) {
      return NextResponse.json({ error: "Completá tus datos personales antes de pagar" }, { status: 400 });
    }

    // Validar shipping
    if (!["HOME_MVD", "AGENCY", "PICKUP"].includes(shippingMethod)) {
      return NextResponse.json({ error: "Método de envío inválido" }, { status: 400 });
    }
    if (shippingMethod === "HOME_MVD") {
      const zone = await prisma.shippingZone.findUnique({ where: { id: shippingData.zoneId ?? "" } });
      if (!zone || !zone.isActive) {
        return NextResponse.json({ error: "Zona de envío inválida" }, { status: 400 });
      }
      if (!shippingData.address) {
        return NextResponse.json({ error: "Ingresá la dirección de entrega" }, { status: 400 });
      }
    }
    if (shippingMethod === "AGENCY" && !shippingData.agency) {
      return NextResponse.json({ error: "Ingresá el nombre de la agencia" }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const preferenceItems = items.map((item, idx) => {
      const unitPrice =
        item.isOffer && item.discountPercentage
          ? Math.round(item.price * (1 - item.discountPercentage / 100) * 100) / 100
          : item.price;
      return {
        id: String(idx),
        title: item.name,
        description: item.description || "Accesorio impreso en 3D — 3DMORE",
        picture_url: item.imageUrl,
        category_id: item.category || "fashion",
        quantity: Number(item.quantity),
        currency_id: "UYU",
        unit_price: unitPrice,
      };
    });

    // Aplicar descuento de promo a los precios
    const finalItems = promoCode && promoDiscount && promoDiscount > 0
      ? preferenceItems.map((item) => ({
          ...item,
          unit_price: Math.round(item.unit_price * (1 - promoDiscount / 100) * 100) / 100,
        }))
      : preferenceItems;

    // Nota: el costo de envío NO se cobra online (es en efectivo/transferencia al entregar).
    // Por eso no se agrega como item a Mercado Pago. Solo se registra en el Order.

    const isPublicUrl = origin.startsWith("https://");

    const mpBody: Parameters<InstanceType<typeof Preference>["create"]>[0]["body"] = {
      items: finalItems,
      payer: {
        name: profile.firstName,
        surname: profile.lastName,
        email: profile.email ?? user.email ?? undefined,
      },
      back_urls: isPublicUrl
        ? {
            success: `${origin}/success`,
            failure: `${origin}/failure`,
            pending: `${origin}/pending`,
          }
        : undefined,
      ...(isPublicUrl ? { auto_return: "approved" as const } : {}),
      statement_descriptor: "3DMORE",
      external_reference: `order_${Date.now()}_${user.id.slice(0, 8)}`,
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: mpBody });

    if (!result.init_point || !result.id) {
      console.error("MP response missing init_point:", result);
      return NextResponse.json({ error: "Error al crear la preferencia de pago" }, { status: 500 });
    }

    // Calcular totales (sin envío, ya que se cobra aparte)
    const subtotal = items.reduce((sum, item) => {
      const unitPrice = item.isOffer && item.discountPercentage
        ? item.price * (1 - item.discountPercentage / 100)
        : item.price;
      return sum + unitPrice * item.quantity;
    }, 0);
    const total = promoCode && promoDiscount && promoDiscount > 0
      ? subtotal * (1 - promoDiscount / 100)
      : subtotal;

    const newOrder = await prisma.order.create({
      data: {
        mpExternalRef: mpBody.external_reference!,
        status: "PENDING",
        items: items,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        promoCode: promoCode || null,
        promoDiscount: promoDiscount || 0,
        userId: user.id,
        shippingMethod,
        shippingCost: Math.round((shippingCost || 0) * 100) / 100,
        shippingData,
        customerFirstName: profile.firstName,
        customerLastName: profile.lastName,
        customerDocument: profile.documentId,
        customerPhone: profile.phone,
        customerEmail: profile.email ?? user.email ?? null,
        payerEmail: profile.email ?? user.email ?? null,
        payerName: `${profile.firstName} ${profile.lastName}`,
      },
    });
    await prisma.orderStatusHistory.create({
      data: { orderId: newOrder.id, status: "PENDING" },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 500 });
  }
}
