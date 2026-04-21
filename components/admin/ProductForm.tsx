"use client";

import { useState } from "react";
import { createProduct } from "@/lib/actions";
import { ImageUploader } from "./ImageUploader";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORIES = ["cuernos", "orejas", "moños", "accesorios"];

export default function ProductForm({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "cuernos",
    isOffer: false,
    discountPct: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setLoading(true);
    try {
      await createProduct({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        thumbnail: thumbnail || undefined,
        isOffer: form.isOffer,
        discountPct: parseFloat(form.discountPct) || 0,
      });
      onCreated();
      onClose();
    } catch (err) {
      alert("Error al crear el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "2rem" }}>
          Nuevo Producto
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Field label="Nombre">
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Descripción">
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Field label="Precio (UYU)">
              <input style={inputStyle} type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </Field>
            <Field label="Categoría">
              <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <input type="checkbox" id="isOffer" checked={form.isOffer} onChange={(e) => setForm({ ...form, isOffer: e.target.checked })} style={{ width: "18px", height: "18px", accentColor: "var(--accent-pink)" }} />
            <label htmlFor="isOffer" style={{ cursor: "pointer" }}>¿Es oferta?</label>
            {form.isOffer && (
              <input style={{ ...inputStyle, width: "120px", marginLeft: "auto" }} type="number" min="0" max="100" placeholder="% descuento" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })} />
            )}
          </div>

          <Field label="Imagen Principal (Thumbnail)">
            <ImageUploader onUploaded={setThumbnail} />
            {thumbnail && <img src={thumbnail} alt="preview" style={{ marginTop: "0.5rem", maxHeight: "100px", borderRadius: "8px", objectFit: "cover" }} />}
          </Field>

          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} style={{ ...secondaryBtnStyle }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Guardando..." : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" };
const modalStyle: React.CSSProperties = { backgroundColor: "#151520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" };
const inputStyle: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "white", width: "100%", fontSize: "0.95rem", outline: "none" };
const primaryBtnStyle: React.CSSProperties = { flex: 1, padding: "0.75rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "linear-gradient(135deg, #ff2a85, #3b82f6)", border: "none", color: "white" };
const secondaryBtnStyle: React.CSSProperties = { padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "white" };
