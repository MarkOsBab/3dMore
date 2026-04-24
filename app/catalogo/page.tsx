import { getFilteredProducts, getActiveCategories, getFeaturedProducts } from "@/lib/actions";
import CatalogFilters from "@/components/CatalogFilters";
import ProductCard from "@/components/ProductCard";
import FeaturedSection from "@/components/FeaturedSection";
import { Package } from "lucide-react";
import type { Metadata } from "next";

// searchParams already forces dynamic rendering per-request; no explicit export needed

export const metadata: Metadata = {
  title: "Catálogo de Accesorios para Casco — 3DMORE",
  description:
    "Explorá todo el catálogo de accesorios para casco impresos en 3D. Orejitas, cuernos, alas y más. Filtrá por categoría.",
  alternates: { canonical: "/catalogo" },
};

type PageProps = {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
};

export default async function CatalogoPage({ searchParams }: PageProps) {
  const { category, search, sort } = await searchParams;

  const [products, categories] = await Promise.all([
    getFilteredProducts({ category, search, sort }),
    getActiveCategories(),
  ]);

  return (
    <main style={{ paddingTop: "6rem", paddingBottom: "4rem" }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800,
              marginBottom: "0.5rem",
              lineHeight: 1.1,
            }}
          >
            CATÁLOGO DE{" "}
            <span className="text-gradient">ACCESORIOS PARA CASCO</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {products.length}{" "}
            {products.length === 1 ? "producto encontrado" : "productos encontrados"}
            {search && (
              <>
                {" "}para &ldquo;<strong style={{ color: "var(--text-primary)" }}>{search}</strong>&rdquo;
              </>
            )}
          </p>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="catalog-layout">
          {/* Sidebar */}
          <CatalogFilters
            categories={categories}
            currentCategory={category}
            currentSearch={search}
            currentSort={sort}
          />

          {/* Grid */}
          <div>
            {products.length === 0 ? (
              <div
                style={{
                  padding: "4rem 2rem",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-xl)",
                  border: "var(--hairline)",
                }}
              >
                <Package
                  size={52}
                  strokeWidth={1}
                  style={{ margin: "0 auto 1rem", display: "block", opacity: 0.35 }}
                />
                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                  No se encontraron productos
                </p>
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  Probá con otros filtros o un término de búsqueda diferente.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${0.05 * i}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

