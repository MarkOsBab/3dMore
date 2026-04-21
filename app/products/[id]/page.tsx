import { getProductById } from "@/lib/actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductInteractive from "./ProductInteractive";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <main className="container animate-fade-in-up" style={{ padding: "6rem 1.5rem" }}>
      <Link
        href="/#products"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", marginBottom: "2rem" }}
      >
        <ArrowLeft size={20} /> Volver al catálogo
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "4rem",
          alignItems: "start",
        }}
      >
        <ProductInteractive product={product as any} />
      </div>
    </main>
  );
}
