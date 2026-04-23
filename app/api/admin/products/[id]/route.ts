import { NextResponse } from "next/server";
import { updateProduct } from "@/lib/actions";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  const passthrough = [
    "name", "description", "price", "categoryId", "thumbnail",
    "isOffer", "discountPct", "isActive", "isFeatured",
    "viewerYaw", "viewerPitch", "viewerZoom",
    "viewerTargetX", "viewerTargetY", "viewerTargetZ",
  ] as const;
  for (const k of passthrough) {
    if (k in body) data[k] = body[k];
  }

  try {
    const product = await updateProduct(id, data);
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "update failed" },
      { status: 500 }
    );
  }
}
