import { getProductById } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductInteractive from "./ProductInteractive";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://3d-more.vercel.app";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return {
      title: "Producto no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} — Accesorio para casco impreso en 3D`;
  const description = product.description
    ? `${product.description.slice(0, 155)}${product.description.length > 155 ? "…" : ""}`
    : `${product.name}: accesorio para casco de moto impreso en 3D. Personalizá tu casco con diseños únicos de 3DMORE. Envíos a todo Uruguay.`;

  const url = `/products/${product.id}`;
  const images = product.thumbnail ? [{ url: product.thumbnail, alt: product.name }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      product.name,
      product.category?.name,
      "accesorios para casco",
      "accesorios casco moto",
      "impresión 3D Uruguay",
      "personalizar casco",
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  // Build a color hex lookup + active palette for the 3D viewer / selector
  const colorHexById: Record<string, string> = {};
  let palette: { id: string; name: string; hex: string }[] = [];
  if (product.parts && product.parts.length > 0) {
    const colors = await prisma.color.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, hex: true, isActive: true },
    });
    for (const c of colors) colorHexById[c.id] = c.hex;
    palette = colors.filter((c) => c.isActive).map(({ id, name, hex }) => ({ id, name, hex }));
  }

  const effectivePrice = product.isOffer && product.discountPct
    ? Math.round(product.price * (1 - product.discountPct / 100) * 100) / 100
    : product.price;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.thumbnail ? [product.thumbnail] : undefined,
    brand: { "@type": "Brand", name: "3DMORE" },
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.id}`,
      priceCurrency: "UYU",
      price: effectivePrice.toFixed(2),
      availability: product.isActive
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "3DMORE" },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Productos", item: `${SITE_URL}/#products` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/products/${product.id}` },
    ],
  };

  return (
    <main className="container animate-fade-in-up" style={{ padding: "4rem 1.5rem 3rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Link
        href="/#products"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", marginBottom: "2rem" }}
        aria-label="Volver al catálogo de accesorios para casco"
      >
        <ArrowLeft size={20} /> Volver al catálogo
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        <ProductInteractive product={{ ...(product as any), colorHexById, palette }} />
      </div>
    </main>
  );
}
