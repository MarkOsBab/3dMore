"use client";

import { useState } from "react";
import { Package } from "lucide-react";

interface Variant {
  id: string;
  colorName: string;
  imageUrl: string;
  stock: number;
}

interface Props {
  thumbnail: string | null;
  variants: Variant[];
  productName: string;
}

export default function VariantSelector({ thumbnail, variants, productName }: Props) {
  const [selected, setSelected] = useState<Variant | null>(variants[0] ?? null);

  const displayImage = selected?.imageUrl ?? thumbnail;

  return (
    <div>
      {/* Main image */}
      <div
        className="glass"
        style={{
          width: "100%",
          aspectRatio: "1/1",
          borderRadius: "24px",
          overflow: "hidden",
          marginBottom: "1.5rem",
        }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={selected ? `${productName} - ${selected.colorName}` : productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
            <Package size={80} strokeWidth={1.2} />
          </div>
        )}
      </div>

      {/* Variant thumbnails */}
      {variants.length > 0 && (
        <div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Color: <strong style={{ color: "white" }}>{selected?.colorName ?? "—"}</strong>
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {variants.map((v) => (
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
                  position: "relative",
                  opacity: v.stock === 0 ? 0.4 : 1,
                }}
              >
                <img
                  src={v.imageUrl}
                  alt={v.colorName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {v.stock === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    AGOTADO
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
