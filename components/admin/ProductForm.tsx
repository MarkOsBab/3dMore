"use client";

import { useState } from "react";
import { createProduct, updateProduct } from "@/lib/actions";
import { ImageUploader } from "./ImageUploader";
import { X, Package, Tag, Sparkles, Image as ImageIcon } from "lucide-react";

interface InitialProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isOffer: boolean;
  discountPct: number | null;
  thumbnail: string | null;
}

interface Props {
  onClose: () => void;
  onSaved: () => void;
  initialProduct?: InitialProduct;
}

const CATEGORIES = ["cuernos", "orejas", "moños", "accesorios"];

export default function ProductForm({ onClose, onSaved, initialProduct }: Props) {
  const isEdit = !!initialProduct;
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState(initialProduct?.thumbnail ?? "");
  const [form, setForm] = useState({
    name: initialProduct?.name ?? "",
    description: initialProduct?.description ?? "",
    price: initialProduct?.price?.toString() ?? "",
    category: initialProduct?.category ?? "cuernos",
    isOffer: initialProduct?.isOffer ?? false,
    discountPct: initialProduct?.discountPct?.toString() ?? "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setLoading(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        thumbnail: thumbnail || undefined,
        isOffer: form.isOffer,
        discountPct: parseFloat(form.discountPct) || 0,
      };
      if (isEdit) {
        await updateProduct(initialProduct.id, data);
      } else {
        await createProduct(data);
      }
      onSaved();
      onClose();
    } catch {
      alert("Error al guardar el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="admin-modal-enter" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={iconBoxStyle}>
              <Package size={18} color="var(--accent-pink)" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.2 }}>
                {isEdit ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              {isEdit && (
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                  ID: {initialProduct.id.slice(0, 8)}…
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Información básica */}
          <section>
            <SectionTitle icon={<Tag size={13} />} label="Información básica" />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <Field label="Nombre del producto">
                <input
                  className="admin-input"
                  placeholder="Ej: Cuernos Galaxy"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  className="admin-input"
                  style={{ minHeight: "80px", resize: "vertical" }}
                  placeholder="Describe el producto…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Field label="Precio base (UYU)">
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", fontSize: "0.85rem", pointerEvents: "none" }}>$</span>
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      style={{ paddingLeft: "1.6rem" }}
                    />
                  </div>
                </Field>
                <Field label="Categoría">
                  <select
                    className="admin-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </section>

          {/* Oferta */}
          <section>
            <SectionTitle icon={<Sparkles size={13} />} label="Oferta" />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label style={{
                display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer",
                padding: "0.75rem 1rem", borderRadius: 10,
                background: form.isOffer ? "rgba(255,42,133,0.07)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${form.isOffer ? "rgba(255,42,133,0.25)" : "rgba(255,255,255,0.07)"}`,
                transition: "all 0.2s",
              }}>
                <input
                  type="checkbox"
                  checked={form.isOffer}
                  onChange={(e) => setForm({ ...form, isOffer: e.target.checked })}
                  style={{ width: 17, height: 17, accentColor: "var(--accent-pink)", flexShrink: 0 }}
                />
                <span style={{ fontSize: "0.9rem" }}>Este producto está en oferta</span>
                {form.isOffer && (
                  <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--accent-pink)", fontWeight: 600, letterSpacing: "0.5px" }}>
                    ACTIVA
                  </span>
                )}
              </label>
              {form.isOffer && (
                <Field label="Porcentaje de descuento">
                  <div style={{ position: "relative" }}>
                    <input
                      className="admin-input"
                      type="number"
                      min="1"
                      max="99"
                      placeholder="20"
                      value={form.discountPct}
                      onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <span style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>%</span>
                  </div>
                </Field>
              )}
            </div>
          </section>

          {/* Imagen */}
          <section>
            <SectionTitle icon={<ImageIcon size={13} />} label="Imagen principal" />
            {thumbnail ? (
              <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <img
                  src={thumbnail}
                  alt="thumbnail"
                  style={{ height: 90, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <button
                  type="button"
                  onClick={() => setThumbnail("")}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem", marginTop: 4 }}
                >
                  <X size={13} /> Quitar
                </button>
              </div>
            ) : null}
            <ImageUploader onUploaded={setThumbnail} />
          </section>

          {/* Acciones */}
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.65 : 1 }}>
              {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</label>
      {children}
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
  width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto",
};
const iconBoxStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
  background: "linear-gradient(135deg, rgba(255,42,133,0.18), rgba(59,130,246,0.18))",
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "1px solid rgba(255,42,133,0.2)",
};
const closeButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", padding: "0.4rem", color: "var(--text-secondary)",
  cursor: "pointer", display: "flex",
};
const primaryBtnStyle: React.CSSProperties = {
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
  padding: "0.75rem", borderRadius: "var(--radius-md)", fontWeight: 600,
  cursor: "pointer", background: "linear-gradient(135deg, #ff2a85, #3b82f6)",
  border: "none", color: "white", fontSize: "0.95rem", transition: "opacity 0.2s",
};
const secondaryBtnStyle: React.CSSProperties = {
  padding: "0.75rem 1.5rem", borderRadius: "var(--radius-md)", fontWeight: 600,
  cursor: "pointer", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)", fontSize: "0.95rem",
};
