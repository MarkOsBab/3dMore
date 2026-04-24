import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Increase the timeout for large 3D model uploads.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Uses service role key — bypasses RLS. Only reachable through Basic Auth middleware.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MODEL_EXTENSIONS = ["stl", "glb", "gltf"];
const MAX_MODEL_SIZE   = 25 * 1024 * 1024; // 25 MB
const MAX_IMAGE_SIZE   = 8  * 1024 * 1024; // 8  MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bucket = (formData.get("bucket") as string) ?? "products";
  const kind = (formData.get("kind") as string) ?? "image"; // "image" | "model"

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const isModel = kind === "model" || MODEL_EXTENSIONS.includes(ext);

  if (isModel && !MODEL_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `Formato no soportado. Usá: ${MODEL_EXTENSIONS.join(", ")}` },
      { status: 400 }
    );
  }

  const limit = isModel ? MAX_MODEL_SIZE : MAX_IMAGE_SIZE;
  if (file.size > limit) {
    return NextResponse.json(
      { error: `El archivo supera el límite de ${limit / 1024 / 1024} MB` },
      { status: 400 }
    );
  }

  const prefix = isModel ? "models/" : "";
  const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // STL/GLB often arrive as application/octet-stream; force a reasonable content type
  const contentType =
    ext === "stl"  ? "model/stl"  :
    ext === "glb"  ? "model/gltf-binary" :
    ext === "gltf" ? "model/gltf+json"   :
    file.type || "application/octet-stream";

  // Pasar ArrayBuffer (no File) para que Supabase respete nuestro contentType
  // y no use el del navegador (que para STL suele ser application/octet-stream).
  const buffer = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, buffer, {
      upsert: false,
      contentType,
      // Files are content-addressed (timestamp + random suffix) — safe to cache indefinitely
      cacheControl: "public, max-age=31536000, immutable",
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl, format: isModel ? ext : null });
}

