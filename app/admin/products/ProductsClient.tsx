"use client";

import { useState, useCallback } from "react";
import { Trash2, Plus, Layers } from "lucide-react";
import { deleteProduct, updateProduct } from "@/lib/actions";
import ProductForm from "@/components/admin/ProductForm";
import VariantForm from "@/components/admin/VariantForm";

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
  isActive: boolean;
  isOffer: boolean;
  discountPct: number | null;
  thumbnail: string | null;
  variants: Variant[];
}

interface Props { initialProducts: Product[] }

export default function ProductsClient({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showCreate, setShowCreate] = useState(false);
  const [variantTarget, setVariantTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    const data: Product[] = await res.json();
    setProducts(data);
    setVariantTarget((prev) => prev ? data.find((p) => p.id === prev.id) ?? null : null);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setDeleting(id);
    await deleteProduct(id);
    setProducts((p) => p.filter((x) => x.id !== id));
    setDeleting(null);
  };

  const handleToggleActive = async (p: Product) => {
    await updateProduct(p.id, { isActive: !p.isActive });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Productos</h1>
        <button onClick={() => setShowCreate(true)} style={primaryBtnStyle}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
          No hay productos aún. ¡Crea el primero!
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {products.map((p) => (
          <div key={p.id} className="glass" style={{ borderRadius: "12px", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1.25rem", opacity: p.isActive ? 1 : 0.5 }}>
            {p.thumbnail
              ? <img src={p.thumbnail} alt={p.name} style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
              : <div style={{ width: "64px", height: "64px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "0.75rem", flexShrink: 0 }}>Sin img</div>
            }

            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                <h3 style={{ fontWeight: 600 }}>{p.name}</h3>
                <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "99px", background: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>{p.category}</span>
                {p.isOffer && <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "99px", background: "rgba(255,42,133,0.2)", color: "var(--accent-pink)" }}>{p.discountPct}% OFF</span>}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                ${p.price} UYU — {p.variants.length} variante(s)
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}>
                <div onClick={() => handleToggleActive(p)} style={{ width: "40px", height: "22px", borderRadius: "99px", background: p.isActive ? "var(--accent-blue)" : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.2s", cursor: "pointer" }}>
                  <div style={{ position: "absolute", top: "3px", left: p.isActive ? "21px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                </div>
                {p.isActive ? "Activo" : "Oculto"}
              </label>

              <button title="Gestionar variantes" onClick={() => setVariantTarget(p)} style={iconBtnStyle}>
                <Layers size={18} />
              </button>
              <button title="Eliminar" disabled={deleting === p.id} onClick={() => handleDelete(p.id)} style={{ ...iconBtnStyle, color: "#ef4444" }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <ProductForm onClose={() => setShowCreate(false)} onCreated={refresh} />
      )}
      {variantTarget && (
        <VariantForm
          productId={variantTarget.id}
          productPrice={variantTarget.price}
          variants={variantTarget.variants}
          onClose={() => setVariantTarget(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

const primaryBtnStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.25rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "linear-gradient(135deg, #ff2a85, #3b82f6)", border: "none", color: "white" };
const iconBtnStyle: React.CSSProperties = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.5rem", color: "white", cursor: "pointer", display: "flex", alignItems: "center" };
