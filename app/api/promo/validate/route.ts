import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/actions";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ valid: false }, { status: 400 });
    const result = await validatePromoCode(code);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ valid: false, error: "Error interno" }, { status: 500 });
  }
}
