"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { ShoppingCart, Package, CheckCircle, Truck, Zap } from "lucide-react";
import { ViewerSkeleton } from "@/components/ProductModelViewer";

const ProductModelViewer = dynamic(() => import("@/components/ProductModelViewer"), {
  ssr: false,
  loading: () => <ViewerSkeleton height="100%" />,
});

interface Variant {
  id: string;
  colorName: string;
  imageUrl: string;
  price: number | null;
  isOffer: boolean;
  discountPct: number | null;
  partColors?: Record<string, string> | null; // { [partId]: colorId }
}

interface Part {
  id: string;
  name: string;
  modelUrl: string;
  format: string;
  positionX: number; positionY: number; positionZ: number;
  rotationX: number; rotationY: number; rotationZ: number;
  scale: number;
  defaultColorId: string | null;
  defaultColor: { id: string; hex: string; name: string } | null;
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
  parts?: Part[];
  // id -> hex map precomputed server-side for all colors referenced by partColors
  colorHexById?: Record<string, string>;
  // active palette for the public multi-swatch selector
  palette?: { id: string; name: string; hex: string }[];
  viewerYaw?: number;
  viewerPitch?: number;
  viewerZoom?: number;
  viewerTargetX?: number;
  viewerTargetY?: number;
  viewerTargetZ?: number;
}

export default function ProductInteractive({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Variant | null>(product.variants[0] ?? null);
  // Per-part custom color override chosen via the palette swatches (partId -> colorId)
  const [customPartColors, setCustomPartColors] = useState<Record<string, string>>({});
  const { addToCart } = useCart();

  const basePrice = selected?.price ?? product.price;
  const effectiveIsOffer = selected ? selected.isOffer : product.isOffer;
  const effectiveDiscountPct = selected ? selected.discountPct : product.discountPct;
  const currentPrice = effectiveIsOffer && effectiveDiscountPct
    ? basePrice * (1 - effectiveDiscountPct / 100)
    : basePrice;

  const displayImage = selected?.imageUrl ?? product.thumbnail;

  const parts = product.parts ?? [];
  const hasModel = parts.length > 0;
  const palette = product.palette ?? [];
  const hexById = product.colorHexById ?? {};

  // Resolve per-part colors: customPartColors > variant.partColors > part.defaultColor
  const partColors = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    const variantMap = selected?.partColors ?? {};
    for (const p of parts) {
      const customId  = customPartColors[p.id];
      const variantId = variantMap[p.id];
      const id        = customId ?? variantId;
      const hex       = id ? hexById[id] : undefined;
      map[p.id] = hex ?? p.defaultColor?.hex ?? "#cccccc";
    }
    return map;
  }, [parts, selected, customPartColors, hexById]);

  // Which color id is currently applied to each part (for highlighting swatches)
  const activeColorIdByPart = useMemo<Record<string, string | undefined>>(() => {
    const out: Record<string, string | undefined> = {};
    const variantMap = selected?.partColors ?? {};
    for (const p of parts) {
      out[p.id] = customPartColors[p.id] ?? variantMap[p.id] ?? p.defaultColorId ?? undefined;
    }
    return out;
  }, [parts, selected, customPartColors]);

  const handleAddToCart = () => {
    // When the product has 3D parts, the "variant" concept is replaced by the
    // combination of chosen colors. Build a unique cart key from that combo.
    let cartId: string;
    let customColors: Record<string, string> | undefined;

    if (hasModel) {
      const comboKey = parts
        .map((p) => `${p.id}:${activeColorIdByPart[p.id] ?? "_"}`)
        .join("|");
      cartId = `${product.id}#${comboKey}`;
      customColors = {};
      for (const p of parts) {
        const colorId = activeColorIdByPart[p.id];
        const colorName = colorId ? (palette.find((c) => c.id === colorId)?.name ?? p.defaultColor?.name) : p.defaultColor?.name;
        if (colorName) customColors[p.name] = colorName;
      }
    } else {
      cartId = selected ? `${product.id}_${selected.id}` : product.id;
    }

    addToCart({
      id: cartId,
      productId: product.id,
      name: product.name,
      description: product.description,
      price: basePrice,
      imageUrl: selected?.imageUrl ?? product.thumbnail ?? "",
      category: product.category,
      variantId: hasModel ? undefined : selected?.id,
      variantColorName: hasModel ? undefined : selected?.colorName,
      isOffer: effectiveIsOffer,
      discountPercentage: effectiveDiscountPct ?? undefined,
      customColors,
    });
  };

  return (
    <>
      {/* Left column: image + variant selector */}
      <div>
        <div
          className="glass"
          style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "24px", overflow: "hidden", marginBottom: "1.5rem" }}
        >
          {/* Inner wrapper fills the aspect-ratio container reliably on all browsers (incl. Safari iOS) */}
          <div style={{ position: "absolute", inset: 0 }}>
          {hasModel ? (
            <ProductModelViewer
              parts={parts}
              partColors={partColors}
              height="100%"
              initialView={{
                yaw: product.viewerYaw ?? 0,
                pitch: product.viewerPitch ?? 0,
                zoom: product.viewerZoom ?? 3,
                targetX: product.viewerTargetX ?? 0,
                targetY: product.viewerTargetY ?? 0,
                targetZ: product.viewerTargetZ ?? 0,
              }}
            />
          ) : displayImage ? (
            <Image
              src={displayImage}
              alt={selected ? `${product.name} - ${selected.colorName}` : product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              priority
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
              <Package size={80} strokeWidth={1.2} />
            </div>
          )}
          </div>
        </div>

        {hasModel ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {parts.map((p) => {
              const activeId = activeColorIdByPart[p.id];
              return (
                <div key={p.id}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {p.name}
                    {activeId ? (
                      <strong style={{ color: "white", textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>
                        · {palette.find((c) => c.id === activeId)?.name ?? p.defaultColor?.name ?? ""}
                      </strong>
                    ) : null}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {palette.map((c) => {
                      const isActive = activeId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() =>
                            setCustomPartColors((prev) => ({ ...prev, [p.id]: c.id }))
                          }
                          title={c.name}
                          aria-label={`${p.name}: ${c.name}`}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: c.hex,
                            border: `2px solid ${isActive ? "var(--accent-pink)" : "rgba(255,255,255,0.15)"}`,
                            outline: isActive ? "2px solid rgba(255,42,133,0.3)" : "none",
                            outlineOffset: 2,
                            cursor: "pointer",
                            padding: 0,
                            transition: "transform 0.15s, border-color 0.15s",
                            transform: isActive ? "scale(1.08)" : "scale(1)",
                            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {Object.keys(customPartColors).length > 0 && (
              <button
                onClick={() => setCustomPartColors({})}
                style={{
                  alignSelf: "flex-start",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  cursor: "pointer",
                }}
              >
                Restaurar colores por defecto
              </button>
            )}
          </div>
        ) : product.variants.length > 0 && (
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
                  <Image
                    src={v.imageUrl}
                    alt={v.colorName}
                    width={64}
                    height={64}
                    style={{ objectFit: "cover", display: "block" }}
                  />
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
