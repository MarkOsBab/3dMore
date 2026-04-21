"use client";

import { useState } from "react";
import { createVariant, deleteVariant } from "@/lib/actions";
import { ImageUploader } from "./ImageUploader";
import { Trash2 } from "lucide-react";

interface Variant {
  id: string;
  colorName: string;
  imageUrl: string;
  price: number | null;
  isOffer: boolean;
  discountPct: number | null;
}

interface Props {
  productId: string;
  productPrice: number;
  variants: Variant[];
  onClose: () => void;
  onSaved: () => void;
}

export default function VariantForm({ productId, productPrice, variants, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [colorName, setColorName] = useState("");
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [price, setPrice] = useState("");
  const [isOffer, setIsOffer] = useState(false);
  const [discountPct, setDiscountPct] = useState("0");

  const handleAdd = async () => {
    if (!colorName || !imageUrl) return alert("Completá el color e imagen");
    setLoading(true);
    try {
      await createVariant({
        productId,
        colorName,
        imageUrl,
        price: useCustomPrice && price ? parseFloat(price) : null,
        isOffer,
        discountPct: isOffer ? parseFloat(discountPct) || 0 : 0,
      });
      setColorName("");
      setImageUrl("");
      setUseCustomPrice(false);
      setPrice("");
      setIsOffer(false);
      setDiscountPct("0");
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm("¿Eliminar esta variante?")) return;
    setDeletingId(variantId);
    try {
      await deleteVariant(variantId, productId);
      onSaved();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Variantes de Color</h2>

        {/* Existing variants */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.85rem", letterSpacing: "1px", marginBottom: "1rem" }}>VARIANTES EXISTENTES</h3>
          {variants.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Sin variantes aún.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {variants.map((v) => {
                const effectivePrice = v.price ?? productPrice;
                const displayPrice = v.isOffer && v.discountPct
                  ? effectivePrice * (1 - v.discountPct / 100)
                  : effectivePrice;
                return (
                  <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.04)" }}>
                    <img src={v.imageUrl} alt={v.colorName} style={{ width: "50px", height: "50px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flexGrow: 1 }}>
                      <p style={{ fontWeight: 600 }}>{v.colorName}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {v.price != null ? `Precio propio: $${displayPrice.toFixed(0)} UYU` : `Precio del producto: $${productPrice.toFixed(0)} UYU`}
                        {v.isOffer && v.discountPct ? ` — ${v.discountPct}% OFF` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "0.4rem", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add new variant */}
        <h3 style={{ color: "var(--text-secondary)", fontSize: "0.85rem", letterSpacing: "1px", marginBottom: "1rem" }}>AGREGAR VARIANTE</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Nombre del Color</label>
            <input style={inputStyle} placeholder="Ej: Rojo Neón" value={colorName} onChange={(e) => setColorName(e.target.value)} />
          </div>

          {/* Custom price toggle */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="checkbox"
                id="useCustomPrice"
                checked={useCustomPrice}
                onChange={(e) => setUseCustomPrice(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "var(--accent-pink)" }}
              />
              <label htmlFor="useCustomPrice" style={{ cursor: "pointer", fontSize: "0.9rem" }}>
                Precio distinto al del producto <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>(base: ${productPrice} UYU)</span>
              </label>
            </div>
            {useCustomPrice && (
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio (UYU)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            )}
          </div>

          {/* Offer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="checkbox"
                id="variantIsOffer"
                checked={isOffer}
                onChange={(e) => setIsOffer(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "var(--accent-pink)" }}
              />
              <label htmlFor="variantIsOffer" style={{ cursor: "pointer", fontSize: "0.9rem" }}>Esta variante tiene descuento</label>
            </div>
            {isOffer && (
              <input
                style={inputStyle}
                type="number"
                min="0"
                max="100"
                placeholder="% de descuento"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
              />
            )}
          </div>

          <div>
            <label style={labelStyle}>Foto de esta variante</label>
            <ImageUploader onUploaded={setImageUrl} />
            {imageUrl && <img src={imageUrl} alt="preview" style={{ marginTop: "0.5rem", maxHeight: "100px", borderRadius: "8px", objectFit: "cover" }} />}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={onClose} style={secondaryBtnStyle}>Cerrar</button>
            <button onClick={handleAdd} disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Guardando..." : "Agregar Variante"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" };
const modalStyle: React.CSSProperties = { backgroundColor: "#151520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" };
const inputStyle: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "white", width: "100%", fontSize: "0.95rem", outline: "none" };
const labelStyle: React.CSSProperties = { fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" };
const primaryBtnStyle: React.CSSProperties = { flex: 1, padding: "0.75rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "linear-gradient(135deg, #ff2a85, #3b82f6)", border: "none", color: "white" };
const secondaryBtnStyle: React.CSSProperties = { padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "white" };
