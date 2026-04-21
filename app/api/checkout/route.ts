import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { items, promoCode, promoDiscount } = await req.json();

    // Determine base URL for back_urls (works in both dev and production)
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Map cart items to MP preference items
    const preferenceItems = items.map((item: {
      name: string;
      description?: string;
      imageUrl?: string;
      category?: string;
      quantity: number;
      price: number;
      isOffer?: boolean;
      discountPercentage?: number;
    }) => {
      const unitPrice =
        item.isOffer && item.discountPercentage
          ? Math.round(item.price * (1 - item.discountPercentage / 100) * 100) / 100
          : item.price;
      return {
        title: item.name,
        description: item.description || "Accesorio impreso en 3D — 3DMORE",
        picture_url: item.imageUrl,
        category_id: item.category || "fashion",
        quantity: Number(item.quantity),
        currency_id: "UYU",
        unit_price: unitPrice,
      };
    });

    // Apply promo code discount directly to item prices
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalItems: any[] =
      promoCode && promoDiscount > 0
        ? preferenceItems.map((item: { unit_price: number }) => ({
            ...item,
            unit_price:
              Math.round(item.unit_price * (1 - promoDiscount / 100) * 100) / 100,
          }))
        : preferenceItems;

    // MP requires back_urls to be publicly accessible (not localhost)
    // auto_return is only valid when back_urls.success is a real public URL
    const isPublicUrl = origin.startsWith("https://");

    const body: Parameters<InstanceType<typeof Preference>["create"]>[0]["body"] = {
      items: finalItems,
      back_urls: isPublicUrl
        ? {
            success: `${origin}/success`,
            failure: `${origin}/failure`,
            pending: `${origin}/pending`,
          }
        : undefined,
      ...(isPublicUrl ? { auto_return: "approved" as const } : {}),
      statement_descriptor: "3DMORE",
      external_reference: `order_${Date.now()}`,
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });

    if (!result.init_point || !result.id) {
      console.error("MP response missing init_point:", result);
      return NextResponse.json({ error: "Error al crear la preferencia de pago" }, { status: 500 });
    }

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number; isOffer?: boolean; discountPercentage?: number }) => {
      const unitPrice = item.isOffer && item.discountPercentage
        ? item.price * (1 - item.discountPercentage / 100)
        : item.price;
      return sum + unitPrice * item.quantity;
    }, 0);
    const total = promoCode && promoDiscount > 0
      ? subtotal * (1 - promoDiscount / 100)
      : subtotal;

    // Crear Order en estado PENDING antes de redirigir
    await prisma.order.create({
      data: {
        mpExternalRef: body.external_reference!,
        status: "PENDING",
        items: items,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        promoCode: promoCode || null,
        promoDiscount: promoDiscount || 0,
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 500 });
  }
}
