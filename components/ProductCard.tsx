"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  thumbnail: string | null;
  isOffer: boolean;
  discountPct: number | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const discounted =
    product.isOffer && product.discountPct
      ? Math.round(product.price * (1 - product.discountPct / 100))
      : null;

  return (
    <div
      className="glass animate-fade-in-up"
      style={{
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Link
        href={`/products/${product.id}`}
        style={{
          position: "relative",
          height: 250,
          display: "block",
          backgroundColor: "var(--bg-dark)",
          overflow: "hidden",
        }}
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px"
            style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
            }}
          >
            <Package size={64} strokeWidth={1.2} />
          </div>
        )}
        {product.isOffer && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "var(--accent-pink)",
              color: "white",
              padding: "4px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {product.discountPct}% OFF
          </div>
        )}
      </Link>

      <div
        style={{
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "0.5rem",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </h3>
          {product.category && (
            <span style={{
              fontSize: "0.68rem", padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(59,130,246,0.1)",
              color: "var(--accent-blue)",
              border: "1px solid rgba(59,130,246,0.2)",
              fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase",
              display: "inline-block", marginTop: 4,
            }}>
              {product.category.name}
            </span>
          )}
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "0.5rem" }}>
            {discounted !== null ? (
              <>
                <span
                  style={{
                    fontSize: "0.8rem",
                    textDecoration: "line-through",
                    color: "var(--text-secondary)",
                    display: "block",
                  }}
                >
                  ${product.price}
                </span>
                <span style={{ fontWeight: 700, color: "var(--accent-pink)" }}>
                  ${discounted}
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 700, color: "var(--accent-blue)" }}>
                ${product.price}
              </span>
            )}
          </div>
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
            flexGrow: 1,
            lineHeight: 1.5,
          }}
        >
          {product.description.length > 80
            ? product.description.slice(0, 80) + "…"
            : product.description}
        </p>
        <Link
          href={`/products/${product.id}`}
          className="btn-primary"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <Eye size={18} /> VER PRODUCTO
        </Link>
      </div>
    </div>
  );
}
