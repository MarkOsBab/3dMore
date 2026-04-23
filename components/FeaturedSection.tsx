"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string | null;
  category: { id: string; name: string; slug: string; sortOrder: number } | null;
  thumbnail: string | null;
  isOffer: boolean;
  discountPct: number | null;
};

export default function FeaturedSection({ products }: { products: Product[] }) {
  return (
    <section
      id="featured"
      style={{
        padding: "5rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw",
          height: "40vw",
          background: "radial-gradient(ellipse, rgba(255,42,133,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--accent-pink)",
                marginBottom: "0.5rem",
              }}
            >
              <Star size={12} fill="currentColor" />
              Destacados
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.1 }}>
              LO MÁS <span className="text-gradient">POPULAR</span>
            </h2>
          </div>

          <Link
            href="/catalogo"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.88rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Ver todas las categorías <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
