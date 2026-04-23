"use client";

import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Database, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string | null;
  category: Category | null;
  thumbnail: string | null;
  isOffer: boolean;
  discountPct: number | null;
}

export default function CatalogSection({ products }: { products: Product[] }) {
  const router = useRouter();

  // Build unique active categories from products, ordered by sortOrder
  const categories = Array.from(
    new Map(
      products
        .filter((p) => p.category)
        .map((p) => [p.category!.id, p.category!])
    ).values()
  ).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section id="products" style={{ padding: "6rem 0", backgroundColor: "rgba(0,0,0,0.3)" }}>
      <div className="container">
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700 }}>
              NUESTROS <span className="text-gradient">PRODUCTOS</span>
            </h2>
            <Link
              href="/catalogo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
                transition: "color 0.15s",
                paddingBottom: "0.25rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-pink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              Ver catálogo completo <ArrowRight size={14} />
            </Link>
          </div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Diseños únicos para destacar en cada viaje.
          </p>

          {/* Category chips → navigate to /catalogo?category=slug */}
          {categories.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <FilterChip
                label="Ver todos"
                active={false}
                onClick={() => router.push("/catalogo")}
              />
              {categories.map((cat) => (
                <FilterChip
                  key={cat.id}
                  label={cat.name}
                  active={false}
                  onClick={() => router.push(`/catalogo?category=${cat.slug}`)}
                />
              ))}
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Database size={20} /> Cargando productos desde la base de datos...</p>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
              Si ves esto, la BD no está conectada aún. Agrega productos desde{" "}
              <a href="/admin/products" style={{ color: "var(--accent-pink)" }}>/admin</a>.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
            {products.map((product, index) => (
              <div key={product.id} style={{ animationDelay: `${0.1 * index}s` }} className="animate-fade-in-up">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.4rem 1rem",
        borderRadius: "var(--radius-pill)",
        border: active ? "1px solid var(--accent-pink)" : "1px solid rgba(255,255,255,0.1)",
        background: active ? "rgba(255,42,133,0.12)" : "rgba(255,255,255,0.03)",
        color: active ? "var(--accent-pink)" : "var(--text-secondary)",
        fontSize: "0.82rem",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {label}
    </button>
  );
}

