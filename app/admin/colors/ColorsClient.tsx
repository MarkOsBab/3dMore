"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, Plus, Pencil, Trash2, Check, X, Power, GripVertical, AlertTriangle } from "lucide-react";

interface Color {
  id: string;
  name: string;
  hex: string;
  isActive: boolean;
  sortOrder: number;
}

export default function ColorsClient() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [newName, setNewName] = useState("");
  const [newHex,  setNewHex]  = useState("#7c3aed");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHex,  setEditHex]  = useState("#000000");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/colors");
    if (res.ok) setColors(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/admin/colors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), hex: newHex }),
    });
    setCreating(false);
    if (res.ok) {
      setNewName("");
      setNewHex("#7c3aed");
      load();
    } else {
      const d = await res.json();
      setCreateError(d.error ?? "Error al crear");
    }
  };

  const startEdit = (c: Color) => {
    setEditId(c.id);
    setEditName(c.name);
    setEditHex(c.hex);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await fetch(`/api/admin/colors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), hex: editHex }),
    });
    setEditId(null);
    load();
  };

  const toggleActive = async (c: Color) => {
    await fetch(`/api/admin/colors/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    load();
  };

  const confirmDelete = async (id: string) => {
    const res = await fetch(`/api/admin/colors/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setDeleteError(d.error ?? "Error");
      return;
    }
    setDeleteId(null);
    setDeleteError("");
    load();
  };

  // Drag & drop
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => { dragId.current = id; };
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragId.current !== id) setDragOverId(id);
  };
  const handleDragEnd = () => { dragId.current = null; setDragOverId(null); };

  const handleDrop = async (targetId: string) => {
    const fromId = dragId.current;
    dragId.current = null;
    setDragOverId(null);
    if (!fromId || fromId === targetId) return;

    const list = [...colors];
    const fromIdx = list.findIndex((c) => c.id === fromId);
    const toIdx   = list.findIndex((c) => c.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    const reordered = list.map((c, i) => ({ ...c, sortOrder: i }));
    setColors(reordered);

    await fetch("/api/admin/colors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((c) => c.id) }),
    });
  };

  const pendingDelete = colors.find((c) => c.id === deleteId);

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,42,133,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Palette size={18} color="var(--accent-pink)" />
        </div>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Paleta de colores</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
            Colores disponibles para variantes y modelos 3D. Ordená arrastrando.
          </p>
        </div>
      </div>

      {/* Create form */}
      <div className="glass" style={{ padding: "1.25rem", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
          Nuevo color
        </p>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <input
              className="admin-input"
              placeholder="Ej: Verde militar, Magenta…"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setCreateError(""); }}
              onKeyDown={(e) => e.key === "Enter" && create()}
              style={{ width: "100%" }}
            />
            {createError && (
              <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: 4 }}>{createError}</p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="color"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value)}
              style={{ width: 48, height: 40, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-sm)", background: "transparent", cursor: "pointer", padding: 2 }}
            />
            <input
              className="admin-input"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value.toLowerCase())}
              style={{ width: 110, fontFamily: "monospace", fontSize: "0.85rem" }}
              maxLength={7}
            />
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

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : colors.length === 0 ? (
        <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>
          <Palette size={32} style={{ marginBottom: "1rem", opacity: 0.3 }} />
          <p>No hay colores aún. Creá el primero arriba.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {colors.map((c) => {
            const isDragOver = dragOverId === c.id;
            const isEditing  = editId === c.id;
            return (
              <div
                key={c.id}
                draggable={!isEditing}
                onDragStart={() => handleDragStart(c.id)}
                onDragOver={(e) => handleDragOver(e, c.id)}
                onDrop={() => handleDrop(c.id)}
                onDragEnd={handleDragEnd}
                className="admin-row-in glass"
                style={{
                  padding: "0.9rem 1.1rem",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${isDragOver ? "rgba(255,42,133,0.5)" : "rgba(255,255,255,0.06)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  opacity: c.isActive ? 1 : 0.5,
                  transition: "border-color 0.15s, background 0.15s",
                  background: isDragOver ? "rgba(255,42,133,0.06)" : undefined,
                  cursor: isEditing ? "default" : "grab",
                }}
              >
                <GripVertical size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />

                {/* Swatch */}
                <div
                  style={{
                    width: 36, height: 36, borderRadius: "var(--radius-sm)",
                    background: c.hex,
                    border: "1px solid rgba(255,255,255,0.12)",
                    flexShrink: 0,
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)",
                  }}
                />

                {isEditing ? (
                  <>
                    <input
                      autoFocus
                      className="admin-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(c.id);
                        if (e.key === "Escape") setEditId(null);
                      }}
                      style={{ flex: 1, padding: "0.4rem 0.7rem", fontSize: "0.92rem" }}
                    />
                    <input
                      type="color"
                      value={editHex}
                      onChange={(e) => setEditHex(e.target.value)}
                      style={{ width: 36, height: 36, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-sm)", background: "transparent", cursor: "pointer", padding: 2 }}
                    />
                    <input
                      className="admin-input"
                      value={editHex}
                      onChange={(e) => setEditHex(e.target.value.toLowerCase())}
                      style={{ width: 100, fontFamily: "monospace", fontSize: "0.82rem", padding: "0.4rem 0.6rem" }}
                      maxLength={7}
                    />
                    <button onClick={() => saveEdit(c.id)} title="Guardar" style={iconBtn("var(--accent-pink)")}>
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditId(null)} title="Cancelar" style={iconBtn("var(--text-muted)")}>
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{c.hex}</div>
                    </div>
                    <button onClick={() => toggleActive(c)} title={c.isActive ? "Ocultar" : "Activar"} style={iconBtn(c.isActive ? "var(--accent-pink)" : "var(--text-muted)")}>
                      <Power size={15} />
                    </button>
                    <button onClick={() => startEdit(c)} title="Editar" style={iconBtn("var(--text-secondary)")}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => { setDeleteId(c.id); setDeleteError(""); }} title="Eliminar" style={iconBtn("var(--danger)")}>
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && pendingDelete && (
        <div
          onClick={() => { setDeleteId(null); setDeleteError(""); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{ padding: "1.75rem", borderRadius: "var(--radius-xl)", maxWidth: 400, width: "90%", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <AlertTriangle size={20} color="var(--danger)" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Eliminar color</h3>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              ¿Eliminar <strong style={{ color: "var(--text-primary)" }}>{pendingDelete.name}</strong>?
              Si está asignado como color por defecto en alguna parte, no podrás eliminarlo.
            </p>
            {deleteError && (
              <p style={{ fontSize: "0.8rem", color: "var(--danger)", marginBottom: "1rem" }}>{deleteError}</p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => { setDeleteId(null); setDeleteError(""); }} style={{ padding: "0.55rem 1.1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "var(--text-secondary)", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "0.85rem" }}>
                Cancelar
              </button>
              <button onClick={() => confirmDelete(pendingDelete.id)} style={{ padding: "0.55rem 1.1rem", background: "var(--danger)", border: "none", color: "white", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function iconBtn(color: string): React.CSSProperties {
  return {
    width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
    color, borderRadius: "var(--radius-sm)", cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
  };
}
