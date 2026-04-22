"use client";

import { useEffect, useState } from "react";
import {
  Tag, Plus, Pencil, Trash2, Check, X, Power, GripVertical, Search,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 15;

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New category form
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit state: id -> name string
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "HIDDEN">("ALL");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setCreating(false);
    if (res.ok) {
      setNewName("");
      load();
    } else {
      const d = await res.json();
      setCreateError(d.error ?? "Error al crear");
    }
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditId(null);
    load();
  };

  const toggleActive = async (cat: Category) => {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    load();
  };

  const confirmDelete = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  };

  const q = search.toLowerCase().trim();
  const filtered = categories.filter((c) => {
    if (filterStatus === "ACTIVE" && !c.isActive) return false;
    if (filterStatus === "HIDDEN" && c.isActive) return false;
    if (q && !c.name.toLowerCase().includes(q)) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,42,133,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Tag size={18} color="var(--accent-pink)" />
        </div>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Categorías</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
            Gestioná las categorías de productos
          </p>
        </div>
      </div>

      {/* Create form */}
      <div className="glass" style={{ padding: "1.25rem", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
          Nueva categoría
        </p>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <input
              className="admin-input"
              placeholder="Ej: Orejitas, Cuernitos, Moños…"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setCreateError(""); }}
              onKeyDown={(e) => e.key === "Enter" && create()}
              style={{ width: "100%" }}
            />
            {createError && (
              <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: 4 }}>{createError}</p>
            )}
          </div>
          <button
            onClick={create}
            disabled={creating || !newName.trim()}
            style={{
              padding: "0.6rem 1.2rem", background: "var(--accent-pink)", color: "white",
              border: "none", borderRadius: "var(--radius-pill)", fontWeight: 600,
              cursor: creating || !newName.trim() ? "not-allowed" : "pointer",
              opacity: creating || !newName.trim() ? 0.5 : 1,
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              fontSize: "0.88rem",
            }}
          >
            <Plus size={15} /> {creating ? "Creando…" : "Crear"}
          </button>
        </div>
      </div>

      {/* Filtros + búsqueda */}
      <div style={{ display: "flex", gap: "0.65rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            className="admin-input"
            placeholder="Buscar categoría…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 36 }}
          />
        </div>
        {(["ALL", "ACTIVE", "HIDDEN"] as const).map((s) => {
          const label = s === "ALL" ? "Todas" : s === "ACTIVE" ? "Activas" : "Ocultas";
          const active = filterStatus === s;
          return (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} style={{ padding: "0.4rem 0.9rem", borderRadius: "var(--radius-pill)", border: `1px solid ${active ? "rgba(255,42,133,0.5)" : "rgba(255,255,255,0.08)"}`, background: active ? "rgba(255,42,133,0.08)" : "transparent", color: active ? "var(--accent-pink)" : "var(--text-secondary)", cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 600 : 400 }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : categories.length === 0 ? (
        <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>
          <Tag size={32} style={{ marginBottom: "1rem", opacity: 0.3 }} />
          <p>No hay categorías aún. Creá la primera arriba.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>
          <Tag size={32} style={{ marginBottom: "1rem", opacity: 0.3 }} />
          <p>Sin resultados para esa búsqueda.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {paginated.map((cat) => (
            <div
              key={cat.id}
              className="admin-row-in glass"
              style={{
                padding: "0.9rem 1.1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                opacity: cat.isActive ? 1 : 0.5,
              }}
            >
              <GripVertical size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />

              {/* Name / edit */}
              {editId === cat.id ? (
                <input
                  autoFocus
                  className="admin-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(cat.id);
                    if (e.key === "Escape") setEditId(null);
                  }}
                  style={{ flex: 1, padding: "0.4rem 0.7rem", fontSize: "0.92rem" }}
                />
              ) : (
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{cat.name}</span>
                  <span style={{ marginLeft: 8, fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    /{cat.slug}
                  </span>
                </div>
              )}

              {/* Products count badge */}
              <span style={{
                padding: "2px 10px", borderRadius: "var(--radius-pill)",
                background: "rgba(255,255,255,0.06)", fontSize: "0.72rem",
                color: "var(--text-secondary)", whiteSpace: "nowrap",
              }}>
                {cat._count.products} producto{cat._count.products !== 1 ? "s" : ""}
              </span>

              {/* Actions */}
              {editId === cat.id ? (
                <>
                  <ActionBtn onClick={() => saveEdit(cat.id)} color="var(--success)" title="Guardar">
                    <Check size={14} />
                  </ActionBtn>
                  <ActionBtn onClick={() => setEditId(null)} color="var(--text-secondary)" title="Cancelar">
                    <X size={14} />
                  </ActionBtn>
                </>
              ) : (
                <>
                  <ActionBtn
                    onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                    color="var(--accent-blue)" title="Editar nombre"
                  >
                    <Pencil size={14} />
                  </ActionBtn>
                  <ActionBtn
                    onClick={() => toggleActive(cat)}
                    color={cat.isActive ? "var(--success)" : "var(--text-muted)"}
                    title={cat.isActive ? "Desactivar" : "Activar"}
                  >
                    <Power size={14} />
                  </ActionBtn>
                  <ActionBtn
                    onClick={() => setDeleteId(cat.id)}
                    color="var(--danger)" title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </ActionBtn>
                </>
              )}
            </div>
          ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </>
      )}

      {/* Delete confirm modal */}
      {deleteId && (() => {
        const cat = categories.find((c) => c.id === deleteId);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setDeleteId(null)}>
            <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-xl)", maxWidth: 400, width: "90%", border: "1px solid rgba(239,68,68,0.3)" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Eliminar categoría</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                ¿Eliminar <strong>{cat?.name}</strong>?
              </p>
              {cat && cat._count.products > 0 && (
                <p style={{ fontSize: "0.82rem", color: "var(--warning, #f59e0b)", marginBottom: "1rem" }}>
                  ⚠️ {cat._count.products} producto{cat._count.products !== 1 ? "s" : ""} quedarán sin categoría.
                </p>
              )}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "0.65rem", background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-pill)", cursor: "pointer", fontWeight: 600 }}>
                  Cancelar
                </button>
                <button onClick={() => confirmDelete(deleteId)} style={{ flex: 1, padding: "0.65rem", background: "var(--danger)", color: "white", border: "none", borderRadius: "var(--radius-pill)", cursor: "pointer", fontWeight: 600 }}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function ActionBtn({ onClick, color, title, children }: {
  onClick: () => void;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "transparent", border: "none", cursor: "pointer",
        color, padding: "0.35rem", borderRadius: 6, display: "flex",
        alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}
