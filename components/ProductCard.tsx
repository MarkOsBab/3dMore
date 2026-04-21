"use client";

import Link from "next/link";
import { useCart, CartProduct } from "@/lib/CartContext";
import { ShoppingCart } from "lucide-react";

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

  return (
    <div
      className="glass animate-fade-in-up"
      style={{ borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(255,42,133,0.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <Link href={`/products/${product.id}`} style={{ position: "relative", height: "250px", display: "block", backgroundColor: "var(--bg-dark)", overflow: "hidden" }}>
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🪖</div>
        )}
        {product.isOffer && (
          <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--accent-pink)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>
            {product.discountPct}% OFF
          </div>
        )}
      </Link>

      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </h3>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "0.5rem" }}>
            {product.isOffer && product.discountPct ? (
              <>
                <span style={{ fontSize: "0.8rem", textDecoration: "line-through", color: "var(--text-secondary)", display: "block" }}>${product.price}</span>
                <span style={{ fontWeight: "bold", color: "var(--accent-pink)" }}>${(product.price * (1 - product.discountPct / 100)).toFixed(0)}</span>
              </>
            ) : (
              <span style={{ fontWeight: "bold", color: "var(--accent-blue)" }}>${product.price}</span>
            )}
          </div>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", flexGrow: 1, lineHeight: 1.5 }}>
          {product.description.length > 80 ? product.description.slice(0, 80) + "…" : product.description}
        </p>
        <button
          className="btn-primary"
          onClick={(e) => { e.preventDefault(); addToCart(cartProduct); }}
          style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
        >
          <ShoppingCart size={18} /> AGREGAR AL CARRITO
        </button>
      </div>
    </div>
  );
}
