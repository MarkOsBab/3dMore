"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, CartProduct } from "@/lib/CartContext";
import { ShoppingCart, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string | null;
  isOffer: boolean;
  discountPct: number | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const cartProduct: CartProduct = {
    id: product.id,
    productId: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.thumbnail ?? "",
    category: product.category,
    isOffer: product.isOffer,
    discountPercentage: product.discountPct ?? undefined,
  };

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
          <img
            src={product.thumbnail}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.4s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
            }}
          >
            🪖
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
        <button
          className="btn-primary"
          onClick={(e) => {
            e.preventDefault();
            if (isAdded) return;
            addToCart(cartProduct);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 1600);
          }}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            background: isAdded ? "var(--success)" : undefined,
            boxShadow: isAdded ? "0 0 18px rgba(34,197,94,0.45)" : undefined,
            animation: isAdded ? "btn-added-pop 0.38s cubic-bezier(0.34,1.56,0.64,1)" : undefined,
            transition: "background 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          {isAdded ? <><Check size={18} /> ¡LISTO!</> : <><ShoppingCart size={18} /> AGREGAR AL CARRITO</>}
        </button>
      </div>
    </div>
  );
}
