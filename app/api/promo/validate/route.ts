import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/actions";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ valid: false }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const result = await validatePromoCode(code, user?.id ?? null);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ valid: false, error: "Error interno" }, { status: 500 });
  }
}
