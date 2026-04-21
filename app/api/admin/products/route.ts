import { NextResponse } from "next/server";
import { getAllProductsAdmin } from "@/lib/actions";

export async function GET() {
  const products = await getAllProductsAdmin();
  return NextResponse.json(products);
}
