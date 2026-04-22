"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";

interface Category {
  id: string;
  name: string;
  slug: string;
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
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Build unique active categories from products
  const categories = Array.from(
    new Map(
      products
        .filter((p) => p.category)
        .map((p) => [p.category!.id, p.category!])
    ).values()
  );

  const filtered =
    activeSlug === null
      ? products
      : products.filter((p) => p.category?.slug === activeSlug);

  return (
    <section id="products" style={{ padding: "6rem 0", backgroundColor: "rgba(0,0,0,0.3)" }}>
      <div className="container">
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            NUESTROS <span className="text-gradient">PRODUCTOS</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Diseños únicos para destacar en cada viaje.
          </p>

          {/* Category filters */}
          {categories.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <FilterChip
                label="Todos"
                active={activeSlug === null}
                onClick={() => setActiveSlug(null)}
              />
              {categories.map((cat) => (
                <FilterChip
                  key={cat.id}
                  label={cat.name}
                  active={activeSlug === cat.slug}
                  onClick={() => setActiveSlug(activeSlug === cat.slug ? null : cat.slug)}
                />
              ))}
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "1.2rem" }}>🚧 Cargando productos desde la base de datos...</p>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
              Si ves esto, la BD no está conectada aún. Agrega productos desde{" "}
              <a href="/admin/products" style={{ color: "var(--accent-pink)" }}>/admin</a>.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
            <p>No hay productos en esta categoría.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
            {filtered.map((product, index) => (
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
    >
      {label}
    </button>
  );
}
