"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { ShoppingCart, Package, CheckCircle, Truck, Zap } from "lucide-react";

interface Variant {
  id: string;
  colorName: string;
  imageUrl: string;
  price: number | null;
  isOffer: boolean;
  discountPct: number | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string | null;
  isOffer: boolean;
  discountPct: number | null;
  variants: Variant[];
}

export default function ProductInteractive({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Variant | null>(product.variants[0] ?? null);
  const { addToCart } = useCart();

  const basePrice = selected?.price ?? product.price;
  const effectiveIsOffer = selected ? selected.isOffer : product.isOffer;
  const effectiveDiscountPct = selected ? selected.discountPct : product.discountPct;
  const currentPrice = effectiveIsOffer && effectiveDiscountPct
    ? basePrice * (1 - effectiveDiscountPct / 100)
    : basePrice;

  const displayImage = selected?.imageUrl ?? product.thumbnail;

  const handleAddToCart = () => {
    const cartId = selected ? `${product.id}_${selected.id}` : product.id;
    addToCart({
      id: cartId,
      productId: product.id,
      name: product.name,
      description: product.description,
      price: basePrice,
      imageUrl: selected?.imageUrl ?? product.thumbnail ?? "",
      category: product.category,
      variantId: selected?.id,
      variantColorName: selected?.colorName,
      isOffer: effectiveIsOffer,
      discountPercentage: effectiveDiscountPct ?? undefined,
    });
  };

  return (
    <>
      {/* Left column: image + variant selector */}
      <div>
        <div
          className="glass"
          style={{ width: "100%", aspectRatio: "1/1", borderRadius: "24px", overflow: "hidden", marginBottom: "1.5rem" }}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt={selected ? `${product.name} - ${selected.colorName}` : product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
              <Package size={80} strokeWidth={1.2} />
            </div>
          )}
        </div>

        {product.variants.length > 0 && (
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>
              Color: <strong style={{ color: "white" }}>{selected?.colorName ?? "—"}</strong>
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  title={v.colorName}
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: `2px solid ${selected?.id === v.id ? "var(--accent-pink)" : "rgba(255,255,255,0.1)"}`,
                    padding: 0,
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  <img src={v.imageUrl} alt={v.colorName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right column: details + price + add to cart */}
      <div>
        {effectiveIsOffer && effectiveDiscountPct && (
          <span style={{ background: "var(--accent-pink)", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.9rem", fontWeight: "bold" }}>
            OFERTA ESPECIAL — {effectiveDiscountPct}% OFF
          </span>
        )}

        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginTop: "1rem" }}>
          {product.name}
        </h1>

        <div style={{ display: "flex", gap: "1rem", alignItems: "baseline", margin: "1rem 0 2rem" }}>
          <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--accent-blue)" }}>
            ${currentPrice.toFixed(0)}
          </span>
          {effectiveIsOffer && effectiveDiscountPct && (
            <span style={{ fontSize: "1.5rem", textDecoration: "line-through", color: "var(--text-secondary)" }}>
              ${basePrice.toFixed(0)}
            </span>
          )}
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>UYU</span>
        </div>

        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "3rem" }}>
          {product.description}
        </p>

        <button
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.1rem", width: "100%", justifyContent: "center" }}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={22} />
          AGREGAR AL CARRITO
        </button>

        <div style={{ marginTop: "3rem", padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ display: "flex", alignItems: "flex-start", gap: 8 }}><CheckCircle size={15} style={{ flexShrink: 0, marginTop: 2, color: "var(--success)" }} /> <span><strong>Material:</strong> PLA / ABS resistente a impactos.</span></p>
          <p style={{ display: "flex", alignItems: "flex-start", gap: 8 }}><Truck size={15} style={{ flexShrink: 0, marginTop: 2, color: "var(--accent-blue)" }} /> <span><strong>Envíos:</strong> A todo Uruguay (DAC / Correo Uruguayo).</span></p>
          <p style={{ display: "flex", alignItems: "flex-start", gap: 8 }}><Zap size={15} style={{ flexShrink: 0, marginTop: 2, color: "var(--accent-pink)" }} /> <span><strong>Instalación:</strong> Todos nuestros productos incluyen cinta doble cara de alta resistencia, soporta viento y altas velocidades.</span></p>
        </div>
      </div>
    </>
  );
}
