import { getProducts, getFeaturedProducts } from "@/lib/actions";
import ReviewsSection from "@/components/ReviewsSection";
import { Package, MapPin, Palette, Truck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import FeaturedSection from "@/components/FeaturedSection";
import CategorySlider from "@/components/CategorySlider";
import Image from "next/image";
import Link from "next/link";

// Cache indefinitely on Vercel CDN; invalidated on-demand via revalidatePath("/") in actions.ts
export const revalidate = false;

export const metadata: Metadata = {
  title: "Accesorios para casco de moto impresos en 3D — Uruguay",
  description:
    "Tienda online de accesorios para casco impresos en 3D en Uruguay. Orejitas, cuernos, alas y diseños únicos para motociclistas. Envíos a todo el país.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "3DMORE | Accesorios para casco de moto impresos en 3D",
    description:
      "Accesorios para casco impresos en 3D en Uruguay. Personalizá tu casco con orejitas, cuernos, alas y más.",
    url: "/",
  },
};

export default async function Home() {
  const [products, featured] = await Promise.all([getProducts(), getFeaturedProducts()]);

  // Group active products by category (server-side — zero client bundle cost)
  type CategoryGroup = {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    products: typeof products;
  };
  const categoryMap = new Map<string, CategoryGroup>();
  const uncategorized: typeof products = [];

  for (const p of products) {
    if (!p.category) {
      uncategorized.push(p);
    } else {
      const k = p.category.id;
      if (!categoryMap.has(k)) {
        categoryMap.set(k, { id: p.category.id, name: p.category.name, slug: p.category.slug, sortOrder: p.category.sortOrder, products: [] });
      }
      categoryMap.get(k)!.products.push(p);
    }
  }

  const categoryGroups = [...categoryMap.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasSliders = categoryGroups.length > 0 || uncategorized.length > 0;

  const trustItems = [
    { Icon: MapPin,       label: "Hecho en Uruguay" },
    { Icon: Palette,      label: "+10 colores disponibles" },
    { Icon: Truck,        label: "Envíos a todo el país" },
    { Icon: ShieldCheck,  label: "Satisfacción garantizada" },
  ];

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "4rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div style={{ position: "absolute", top: "20%", left: "-10%", width: "40vw", height: "40vw", background: "var(--glow-pink)", filter: "blur(100px)", borderRadius: "50%", zIndex: -1 }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "30vw", height: "30vw", background: "var(--glow-blue)", filter: "blur(100px)", borderRadius: "50%", zIndex: -1 }} />

        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "2rem", alignItems: "center" }}>
          <div className="animate-fade-in-up">
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1.1, marginBottom: "1rem", fontWeight: 800 }}>
              ACCESORIOS PARA <br />
              <span className="text-gradient">CASCO</span>
            </h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "500px" }}>
              Accesorios para casco impresos en 3D en Uruguay. Orejitas, cuernos, alas y diseños únicos para personalizar tu casco. Expresá tu estilo en el asfalto.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a href="#featured" className="btn-primary" style={{ display: "inline-block", padding: "1rem 2rem" }}>
                Ver Destacados
              </a>
              <Link href="/catalogo" className="btn-outline">
                Ver catálogo completo
              </Link>
            </div>
          </div>

          <div className="hero-product-col animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {products[0]?.thumbnail ? (
              <div
                className="glass"
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: "24px",
                  overflow: "hidden",
                  position: "relative",
                  background: "linear-gradient(145deg, rgba(21,21,32,.8), rgba(10,10,15,.8))",
                }}
              >
                <Image
                  src={products[0].thumbnail}
                  alt={products[0].name}
                  fill
                  priority
                  sizes="45vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "24px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                <Package size={100} strokeWidth={1} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Featured ──────────────────────────────────────────────────── */}
      {featured.length > 0 && <FeaturedSection products={featured} />}

      {/* ── Trust band ────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "2.5rem 0",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1.5rem 2.5rem",
            }}
          >
            {trustItems.map(({ Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Icon size={18} color="var(--accent-pink)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products by category ──────────────────────────────────────── */}
      {hasSliders && (
        <section style={{ padding: "5rem 0" }}>
          <div className="container">
            {/* Section header */}
            <div style={{ marginBottom: "3rem" }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--accent-pink)",
                  marginBottom: "0.5rem",
                }}
              >
                Todos los productos
              </p>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, lineHeight: 1.1 }}>
                EXPLORAR POR <span className="text-gradient">CATEGORÍA</span>
              </h2>
            </div>

            {/* One slider per category */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
              {categoryGroups.map((g) => (
                <CategorySlider
                  key={g.id}
                  categoryName={g.name}
                  categorySlug={g.slug}
                  products={g.products}
                />
              ))}
              {uncategorized.length > 0 && (
                <CategorySlider
                  categoryName="Otros productos"
                  categorySlug={null}
                  products={uncategorized}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews ───────────────────────────────────────────────────── */}
      <ReviewsSection />
    </main>
  );
}
