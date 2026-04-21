import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    const formattedItems = items.map((item: any) => ({
      title: item.name,
      description: item.description || "Accesorio impreso en 3D",
      picture_url: item.imageUrl,
      category_id: item.category,
      quantity: Number(item.quantity),
      currency_id: "UYU", // Peso Uruguayo
      unit_price: Number(item.isOffer && item.discountPercentage 
        ? item.price * (1 - item.discountPercentage / 100) 
        : item.price
      ),
    }));

    // Uso seguro directo de fetch API para MercadoPago.
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: formattedItems,
        back_urls: {
          success: "https://3dmore.vercel.app/success",
          failure: "https://3dmore.vercel.app/failure",
          pending: "https://3dmore.vercel.app/pending"
        },
        auto_return: "approved"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error from MercadoPago:", data);
      return NextResponse.json({ error: "Error de Mercado Pago" }, { status: 400 });
    }

    // Retorna init_point (redirect user URL)
    return NextResponse.json({ url: data.init_point });
  } catch (error) {
    console.error("Internal Server Error: ", error);
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 500 });
  }
}
