"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, Trash2, Save, X, Power } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  cost: number;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminShippingPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", cost: "", sortOrder: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; cost: string; sortOrder: string }>({ name: "", cost: "", sortOrder: "" });

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/shipping/zones?all=1");
    if (r.ok) setZones(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name || !form.cost) return;
    const r = await fetch("/api/shipping/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        cost: Number(form.cost),
        sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
      }),
    });
    if (r.ok) {
      setForm({ name: "", cost: "", sortOrder: "" });
      setCreating(false);
      load();
    } else {
      const err = await r.json();
      alert(err.error ?? "Error al crear");
    }
  };

  const startEdit = (z: Zone) => {
    setEditing(z.id);
    setEditForm({ name: z.name, cost: String(z.cost), sortOrder: String(z.sortOrder) });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const r = await fetch(`/api/shipping/zones/${editing}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        cost: Number(editForm.cost),
        sortOrder: Number(editForm.sortOrder),
      }),
    });
    if (r.ok) {
      setEditing(null);
      load();
    }
  };

  const toggle = async (z: Zone) => {
    await fetch(`/api/shipping/zones/${z.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !z.isActive }),
    });
    load();
  };

  const remove = async (z: Zone) => {
    if (!confirm(`¿Eliminar la zona "${z.name}"?`)) return;
    await fetch(`/api/shipping/zones/${z.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
            <Truck color="var(--accent-pink)" /> Zonas de envío
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 4 }}>
            Definí los costos de envío a domicilio en Montevideo.
          </p>
        </div>
        <button
          onClick={() => setCreating(!creating)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.65rem 1.1rem", background: "var(--accent-pink)", color: "white", border: "none", borderRadius: "var(--radius-pill)", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem" }}
        >
          <Plus size={16} /> Nueva zona
        </button>
      </div>

      {creating && (
        <div className="glass admin-slide-down" style={{ padding: "1.25rem", borderRadius: "var(--radius-lg)", marginBottom: "1rem", border: "1px solid rgba(255,42,133,0.2)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto auto", gap: "0.6rem", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Pocitos" />
            </div>
            <div>
              <label style={labelStyle}>Costo ($)</label>
              <input className="admin-input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} type="number" />
            </div>
            <div>
              <label style={labelStyle}>Orden</label>
              <input className="admin-input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} type="number" placeholder="0" />
            </div>
            <button onClick={create} style={iconBtn("var(--success)")}><Save size={16} /></button>
            <button onClick={() => setCreating(false)} style={iconBtn("var(--text-secondary)")}><X size={16} /></button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center" }}><div className="spinner" style={{ width: 28, height: 28, margin: "0 auto" }} /></div>
      ) : zones.length === 0 ? (
        <p style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>No hay zonas configuradas.</p>
      ) : (
        <div className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
          {zones.map((z) => (
            <div key={z.id}
              className="admin-row-in"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr auto",
                gap: "1rem",
                alignItems: "center",
                padding: "0.9rem 1.2rem",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                opacity: z.isActive ? 1 : 0.45,
              }}>
              {editing === z.id ? (
                <>
                  <input className="admin-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <input className="admin-input" value={editForm.cost} onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })} type="number" />
                  <input className="admin-input" value={editForm.sortOrder} onChange={(e) => setEditForm({ ...editForm, sortOrder: e.target.value })} type="number" />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={saveEdit} style={iconBtn("var(--success)")}><Save size={14} /></button>
                    <button onClick={() => setEditing(null)} style={iconBtn("var(--text-secondary)")}><X size={14} /></button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p style={{ fontWeight: 600 }}>{z.name}</p>
                    {!z.isActive && <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Inactiva</p>}
                  </div>
                  <p style={{ fontFamily: "var(--font-mono)", color: "var(--accent-blue)" }}>${z.cost}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Orden: {z.sortOrder}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggle(z)} title={z.isActive ? "Desactivar" : "Activar"} style={iconBtn(z.isActive ? "var(--warning, #f59e0b)" : "var(--success)")}>
                      <Power size={14} />
                    </button>
                    <button onClick={() => startEdit(z)} style={{ ...iconBtn("var(--accent-blue)"), fontSize: "0.72rem", padding: "0.45rem 0.7rem" }}>Editar</button>
                    <button onClick={() => remove(z)} style={iconBtn("var(--danger)")}><Trash2 size={14} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 600, letterSpacing: "1px",
  color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4, display: "block",
};

const iconBtn = (color: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: "0.5rem 0.75rem", background: "transparent",
  color, border: `1px solid ${color}`, borderRadius: "var(--radius-sm)",
  cursor: "pointer", fontWeight: 600,
});
