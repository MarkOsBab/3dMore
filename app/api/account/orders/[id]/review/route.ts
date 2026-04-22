import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, userId: true, reviewRating: true },
  });

  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  if (order.userId !== user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (order.status !== "DELIVERED") {
    return NextResponse.json({ error: "Solo podés reseñar un pedido entregado" }, { status: 422 });
  }
  if (order.reviewRating !== null) {
    return NextResponse.json({ error: "Ya dejaste una reseña para este pedido" }, { status: 422 });
  }

  const formData = await req.formData();
  const rating = Number(formData.get("rating"));
  const text = (formData.get("text") as string | null)?.trim() ?? "";
  const file = formData.get("photo") as File | null;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Calificación inválida (1-5)" }, { status: 400 });
  }

  let reviewImageUrl: string | null = null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "Solo se permiten imágenes JPG, PNG o WEBP" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no puede superar 5 MB" }, { status: 400 });
    }
    const fileName = `reviews/${id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("products")
      .upload(fileName, file, { upsert: false });
    if (uploadError) {
      return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
    }
    const { data: urlData } = supabaseAdmin.storage.from("products").getPublicUrl(fileName);
    reviewImageUrl = urlData.publicUrl;
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { reviewRating: rating, reviewText: text || null, reviewImageUrl },
  });

  return NextResponse.json({
    reviewRating: updated.reviewRating,
    reviewText: updated.reviewText,
    reviewImageUrl: updated.reviewImageUrl,
  });
}
