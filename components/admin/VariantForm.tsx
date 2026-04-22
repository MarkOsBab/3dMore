"use client";

import { useState } from "react";
import { createVariant, deleteVariant } from "@/lib/actions";
import { ImageUploader } from "./ImageUploader";
import { Trash2, Plus, Layers, X, Palette, Sparkles } from "lucide-react";
import { useConfirm, useAlert } from "@/components/admin/ConfirmDialog";

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
  productName: string;
  productPrice: number;
  variants: Variant[];
  onClose: () => void;
  onSaved: () => void;
}

export default function VariantForm({ productId, productName, productPrice, variants, onClose, onSaved }: Props) {
  const confirm = useConfirm();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [colorName, setColorName] = useState("");
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [price, setPrice] = useState("");
  const [isOffer, setIsOffer] = useState(false);
  const [discountPct, setDiscountPct] = useState("0");

  const resetForm = () => {
    setColorName("");
    setImageUrl("");
    setUseCustomPrice(false);
    setPrice("");
    setIsOffer(false);
    setDiscountPct("0");
  };

  const handleAdd = async () => {
    if (!colorName.trim()) { await alert("Ingresá el nombre del color"); return; }
    if (!imageUrl) { await alert("Subí una imagen para la variante"); return; }
    setLoading(true);
    try {
      await createVariant({
        productId,
        colorName: colorName.trim(),
        imageUrl,
        price: useCustomPrice && price ? parseFloat(price) : null,
        isOffer,
        discountPct: isOffer ? parseFloat(discountPct) || 0 : 0,
      });
      resetForm();
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!await confirm({ message: "¿Seguro que querés eliminar esta variante?", title: "Eliminar variante" })) return;
    setDeletingId(variantId);
    await deleteVariant(variantId, productId);
    setDeletingId(null);
    setExitingId(variantId);
    setTimeout(() => {
      setExitingId(null);
      onSaved();
    }, 520);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="admin-modal-enter" style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={iconBoxStyle}>
              <Layers size={18} color="var(--accent-blue)" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.2 }}>Variantes de Color</h2>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>{productName}</p>
            </div>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={18} />
          </button>
        </div>

        {/* Existing variants */}
        <div style={{ marginBottom: "1.75rem" }}>
          <SectionTitle icon={<Palette size={13} />} label={`Variantes existentes (${variants.length})`} />
          {variants.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
              <Layers size={28} color="var(--text-muted)" style={{ margin: "0 auto 0.6rem" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                Sin variantes. Agregá la primera abajo.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {variants.map((v) => {
                const base = v.price ?? productPrice;
                const final = v.isOffer && v.discountPct ? base * (1 - v.discountPct / 100) : base;
                return (
                  <div key={v.id} className={exitingId === v.id ? "admin-row-exit-wrapper" : ""}>
                  <div
                    className={exitingId === v.id ? "admin-row-exiting" : ""}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.75rem", borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <img
                      src={v.imageUrl}
                      alt={v.colorName}
                      style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{v.colorName}</p>
                      <p style={{ fontSize: "0.77rem", color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)" }}>${final.toFixed(0)} UYU</span>
                        {v.price != null && <span style={{ opacity: 0.55 }}>· precio propio</span>}
                        {v.isOffer && v.discountPct ? (
                          <span style={{ background: "rgba(255,42,133,0.15)", color: "var(--accent-pink)", borderRadius: 4, padding: "1px 6px", fontSize: "0.7rem", fontWeight: 600 }}>
                            {v.discountPct}% OFF
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={!!deletingId}
                      className="admin-icon-btn danger"
                      style={{ opacity: deletingId === v.id ? 0.5 : 1 }}
                    >
                      {deletingId === v.id ? <span className="admin-delete-spinner" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add new variant */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
          <SectionTitle icon={<Plus size={13} />} label="Nueva variante" />
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Nombre del Color</label>
                <input
                  className="admin-input"
                  placeholder="Ej: Rojo Neón"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Precio base del producto</label>
                <input
                  className="admin-input"
                  value={`$${productPrice} UYU`}
                  readOnly
                  style={{ opacity: 0.45, cursor: "default" }}
                />
              </div>
            </div>

            {/* Precio custom */}
            <label style={{
              display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer",
              padding: "0.65rem 0.85rem", borderRadius: 8,
              background: useCustomPrice ? "rgba(59,130,246,0.07)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${useCustomPrice ? "rgba(59,130,246,0.22)" : "rgba(255,255,255,0.06)"}`,
              transition: "all 0.2s",
            }}>
              <input
                type="checkbox"
                checked={useCustomPrice}
                onChange={(e) => setUseCustomPrice(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--accent-blue)", flexShrink: 0 }}
              />
              <span style={{ fontSize: "0.88rem" }}>Precio distinto para esta variante</span>
            </label>
            {useCustomPrice && (
              <div>
                <label style={labelStyle}>Precio (UYU)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", fontSize: "0.85rem", pointerEvents: "none" }}>$</span>
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ paddingLeft: "1.6rem" }}
                  />
                </div>
              </div>
            )}

            {/* Oferta */}
            <label style={{
              display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer",
              padding: "0.65rem 0.85rem", borderRadius: 8,
              background: isOffer ? "rgba(255,42,133,0.07)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${isOffer ? "rgba(255,42,133,0.22)" : "rgba(255,255,255,0.06)"}`,
              transition: "all 0.2s",
            }}>
              <input
                type="checkbox"
                checked={isOffer}
                onChange={(e) => setIsOffer(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--accent-pink)", flexShrink: 0 }}
              />
              <span style={{ fontSize: "0.88rem" }}>Esta variante tiene descuento</span>
              {isOffer && <Sparkles size={14} color="var(--accent-pink)" style={{ marginLeft: "auto" }} />}
            </label>
            {isOffer && (
              <div>
                <label style={labelStyle}>% de descuento</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="admin-input"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="20"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(e.target.value)}
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <span style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>%</span>
                </div>
              </div>
            )}

            {/* Imagen */}
            <div>
              <label style={labelStyle}>Foto de la variante</label>
              <ImageUploader onUploaded={setImageUrl} />
              {imageUrl && (
                <div style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <img src={imageUrl} alt="preview" style={{ height: 72, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem" }}
                  >
                    <X size={13} /> Quitar
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
              <button type="button" onClick={onClose} style={secondaryBtnStyle}>Cerrar</button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={loading}
                style={{ ...primaryBtnStyle, opacity: loading ? 0.65 : 1 }}
              >
                <Plus size={16} />
                {loading ? "Guardando…" : "Agregar Variante"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
      <span style={{ color: "var(--accent-pink)", display: "flex" }}>{icon}</span>
      <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase" as const, color: "var(--text-secondary)" }}>
        {label}
      </span>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.82)",
  backdropFilter: "blur(6px)", zIndex: 200,
  display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
};
const modalStyle: React.CSSProperties = {
  backgroundColor: "#13131e",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "var(--radius-xl)",
  padding: "2rem",
  width: "100%", maxWidth: "580px", maxHeight: "90vh", overflowY: "auto",
};
const iconBoxStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
  background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(255,42,133,0.18))",
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "1px solid rgba(59,130,246,0.22)",
};
const closeButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", padding: "0.4rem", color: "var(--text-secondary)",
  cursor: "pointer", display: "flex",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500,
  display: "block", marginBottom: "0.35rem",
};
const primaryBtnStyle: React.CSSProperties = {
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
  padding: "0.75rem", borderRadius: "var(--radius-md)", fontWeight: 600,
  cursor: "pointer", background: "linear-gradient(135deg, #ff2a85, #3b82f6)",
  border: "none", color: "white", fontSize: "0.95rem", transition: "opacity 0.2s",
};
const secondaryBtnStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem", borderRadius: "var(--radius-md)", fontWeight: 600,
  cursor: "pointer", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)", fontSize: "0.95rem",
};
