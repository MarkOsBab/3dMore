"use client";

import { useState, useCallback } from "react";
import { Trash2, Plus, Layers, Package, Pencil, Search } from "lucide-react";
import { deleteProduct, updateProduct } from "@/lib/actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import ProductForm from "@/components/admin/ProductForm";
import VariantForm from "@/components/admin/VariantForm";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 10;

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
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  isActive: boolean;
  isOffer: boolean;
  discountPct: number | null;
  thumbnail: string | null;
  variants: Variant[];
}

interface Props { initialProducts: Product[] }

export default function ProductsClient({ initialProducts }: Props) {
  const confirm = useConfirm();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [variantTarget, setVariantTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exiting, setExiting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "HIDDEN">("ALL");
  const [filterOffer, setFilterOffer] = useState<"ALL" | "OFFER" | "REGULAR">("ALL");
  const [page, setPage] = useState(1);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    const data: Product[] = await res.json();
    setProducts(data);
    setVariantTarget((prev) => prev ? data.find((p) => p.id === prev.id) ?? null : null);
  }, []);

  const resetFilters = () => { setSearch(""); setFilterStatus("ALL"); setFilterOffer("ALL"); setPage(1); };

  const q = search.toLowerCase().trim();
  const filtered = products.filter((p) => {
    if (filterStatus === "ACTIVE" && !p.isActive) return false;
    if (filterStatus === "HIDDEN" && p.isActive) return false;
    if (filterOffer === "OFFER" && !p.isOffer) return false;
    if (filterOffer === "REGULAR" && p.isOffer) return false;
    if (q && !p.name.toLowerCase().includes(q) && !(p.category?.name.toLowerCase().includes(q))) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!await confirm({ message: "¿Seguro que querés eliminar este producto? Esta acción no se puede deshacer.", title: "Eliminar producto" })) return;
    setDeleting(id);
    await deleteProduct(id);
    setDeleting(null);
    setExiting(id);
    setTimeout(() => {
      setProducts((p) => p.filter((x) => x.id !== id));
      setExiting(null);
    }, 520);
  };

  const handleToggleActive = async (p: Product) => {
    await updateProduct(p.id, { isActive: !p.isActive });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
            <Package size={20} color="var(--accent-blue)" />
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Productos</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {products.length} producto{products.length !== 1 ? "s" : ""} en catálogo
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} style={primaryBtnStyle}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            className="admin-input"
            placeholder="Buscar por nombre o categoría…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Grupo: visibilidad */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em" }}>Estado</span>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {(["ALL", "ACTIVE", "HIDDEN"] as const).map((s) => {
                const label = s === "ALL" ? "Todos" : s === "ACTIVE" ? "Activos" : "Ocultos";
                const active = filterStatus === s;
                return (
                  <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} style={{ padding: "0.35rem 0.85rem", borderRadius: "var(--radius-pill)", border: `1px solid ${active ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`, background: active ? "rgba(59,130,246,0.1)" : "transparent", color: active ? "var(--accent-blue)" : "var(--text-secondary)", cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 600 : 400, transition: "all 0.15s" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Separador */}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

          {/* Grupo: oferta */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em" }}>Precio</span>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {(["ALL", "OFFER", "REGULAR"] as const).map((s) => {
                const label = s === "ALL" ? "Todos" : s === "OFFER" ? "En oferta" : "Sin oferta";
                const active = filterOffer === s;
                return (
                  <button key={s} onClick={() => { setFilterOffer(s); setPage(1); }} style={{ padding: "0.35rem 0.85rem", borderRadius: "var(--radius-pill)", border: `1px solid ${active ? "rgba(255,42,133,0.5)" : "rgba(255,255,255,0.08)"}`, background: active ? "rgba(255,42,133,0.08)" : "transparent", color: active ? "var(--accent-pink)" : "var(--text-secondary)", cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 600 : 400, transition: "all 0.15s" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {(q || filterStatus !== "ALL" || filterOffer !== "ALL") && (
            <button onClick={resetFilters} style={{ marginLeft: "auto", padding: "0.35rem 0.75rem", borderRadius: "var(--radius-pill)", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem" }}>
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="glass"
          style={{
            textAlign: "center",
            padding: "4rem",
            borderRadius: "var(--radius-xl)",
            color: "var(--text-secondary)",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <Package size={40} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 500 }}>{q ? "Sin resultados para esa búsqueda" : "Sin productos todavía"}</p>
          <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Creá el primero con el botón de arriba.</p>
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {paginated.map((p, i) => (
          <div key={p.id} className={exiting === p.id ? "admin-row-exit-wrapper" : ""}>
          <div
            className={`glass admin-product-row admin-row-in${exiting === p.id ? " admin-row-exiting" : ""}`}
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              opacity: p.isActive ? 1 : 0.45,
              animationDelay: `${i * 0.04}s`,
            }}
          >
            {p.thumbnail
              ? <img src={p.thumbnail} alt={p.name} style={{ width: "60px", height: "60px", borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
              : (
                <div
                  style={{
                    width: "60px", height: "60px", borderRadius: "var(--radius-md)",
                    background: "var(--surface-2)", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "var(--text-muted)", flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Package size={20} />
                </div>
              )
            }

            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem", flexWrap: "wrap" }}>
                <h3 style={{ fontWeight: 600, fontSize: "0.95rem" }}>{p.name}</h3>
                <span
                  style={{
                    fontSize: "0.7rem", padding: "2px 7px", borderRadius: "99px",
                    background: "var(--surface-2)", color: "var(--text-secondary)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {p.category?.name ?? "Sin categoría"}
                </span>
                {p.isOffer && (
                  <span
                    style={{
                      fontSize: "0.7rem", padding: "2px 7px", borderRadius: "99px",
                      background: "rgba(255,42,133,0.15)", color: "var(--accent-pink)",
                      border: "1px solid rgba(255,42,133,0.25)",
                    }}
                  >
                    {p.discountPct}% OFF
                  </span>
                )}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                <span style={{ fontFamily: "var(--font-mono)" }}>${p.price} UYU</span>
                <span style={{ margin: "0 0.4rem", opacity: 0.4 }}>·</span>
                {p.variants.length} variante{p.variants.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
              {/* Toggle activo */}
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                title={p.isActive ? "Publicado" : "Oculto"}
              >
                <div
                  onClick={() => handleToggleActive(p)}
                  style={{
                    width: "38px", height: "20px", borderRadius: "99px",
                    background: p.isActive ? "var(--accent-blue)" : "rgba(255,255,255,0.12)",
                    position: "relative", transition: "background 0.25s", cursor: "pointer",
                    boxShadow: p.isActive ? "0 0 8px rgba(59,130,246,0.4)" : "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute", top: "2px",
                      left: p.isActive ? "20px" : "2px",
                      width: "16px", height: "16px",
                      borderRadius: "50%", background: "white",
                      transition: "left 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  {p.isActive ? "Activo" : "Oculto"}
                </span>
              </label>

              <button
                title="Editar producto"
                onClick={() => setEditTarget(p)}
                className="admin-icon-btn"
              >
                <Pencil size={16} />
              </button>
              <button
                title="Gestionar variantes"
                onClick={() => setVariantTarget(p)}
                className="admin-icon-btn"
              >
                <Layers size={16} />
              </button>
              <button
                title="Eliminar producto"
                disabled={!!deleting}
                onClick={() => handleDelete(p.id)}
                className="admin-icon-btn danger"
                style={{ opacity: deleting === p.id ? 0.5 : 1 }}
              >
                {deleting === p.id ? <span className="admin-delete-spinner" /> : <Trash2 size={16} />}
              </button>
            </div>
          </div>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />

      {showCreate && (
        <ProductForm onClose={() => setShowCreate(false)} onSaved={refresh} />
      )}
      {editTarget && (
        <ProductForm
          initialProduct={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); refresh(); }}
        />
      )}
      {variantTarget && (
        <VariantForm
          productId={variantTarget.id}
          productName={variantTarget.name}
          productPrice={variantTarget.price}
          variants={variantTarget.variants}
          onClose={() => setVariantTarget(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

const primaryBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.65rem 1.25rem",
  borderRadius: "var(--radius-pill)",
  fontWeight: 600,
  cursor: "pointer",
  background: "var(--accent-neon)",
  border: "none",
  color: "white",
  boxShadow: "var(--shadow-cta-pink)",
  fontSize: "0.9rem",
};
