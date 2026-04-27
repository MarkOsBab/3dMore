"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, Trash2, Save, X, Power, MapPin, Home } from "lucide-react";
import { useConfirm, useAlert } from "@/components/admin/ConfirmDialog";
import { isMeetingPointZone, zoneAllowsHomeDelivery } from "@/lib/shipping";

interface Zone {
  id: string;
  name: string;
  cost: number;
  isActive: boolean;
  sortOrder: number;
  isMeetingPoint: boolean | null;
  meetingPointName: string | null;
}

type CreateForm = {
  name: string;
  cost: string;
  sortOrder: string;
  isMeetingPoint: "auto" | "yes" | "no";
  meetingPointName: string;
};
type EditForm = CreateForm;

const EMPTY_FORM: CreateForm = { name: "", cost: "", sortOrder: "", isMeetingPoint: "auto", meetingPointName: "" };

function fromZone(z: Zone): EditForm {
  return {
    name: z.name,
    cost: String(z.cost),
    sortOrder: String(z.sortOrder),
    isMeetingPoint: z.isMeetingPoint === null ? "auto" : z.isMeetingPoint ? "yes" : "no",
    meetingPointName: z.meetingPointName ?? "",
  };
}

function toPayload(f: CreateForm) {
  return {
    name: f.name,
    cost: Number(f.cost),
    sortOrder: f.sortOrder ? Number(f.sortOrder) : 0,
    isMeetingPoint: f.isMeetingPoint === "auto" ? null : f.isMeetingPoint === "yes",
    meetingPointName: f.meetingPointName.trim() || null,
  };
}

export default function AdminShippingPage() {
  const confirm = useConfirm();
  const alert = useAlert();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [exiting, setExiting] = useState<string | null>(null);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);

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
      body: JSON.stringify(toPayload(form)),
    });
    if (r.ok) {
      setForm(EMPTY_FORM);
      setCreating(false);
      load();
    } else {
      const err = await r.json();
      await alert(err.error ?? "Error al crear");
    }
  };

  const startEdit = (z: Zone) => {
    setEditing(z.id);
    setEditForm(fromZone(z));
  };

  const saveEdit = async () => {
    if (!editing) return;
    const r = await fetch(`/api/shipping/zones/${editing}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(editForm)),
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
    if (!await confirm({ message: `¿Seguro que querés eliminar la zona "${z.name}"?`, title: "Eliminar zona" })) return;
    setRemoving(z.id);
    await fetch(`/api/shipping/zones/${z.id}`, { method: "DELETE" });
    setRemoving(null);
    setExiting(z.id);
    setTimeout(() => {
      setZones((prev) => prev.filter((x) => x.id !== z.id));
      setExiting(null);
    }, 520);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
            <Truck color="var(--accent-pink)" /> Zonas y puntos de encuentro
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 4 }}>
            Las zonas marcadas como punto de encuentro habilitan envío a domicilio dentro del barrio.
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
          <ZoneFormFields form={form} setForm={setForm} />
          <div style={{ display: "flex", gap: 6, marginTop: "0.75rem", justifyContent: "flex-end" }}>
            <button onClick={() => setCreating(false)} style={iconBtn("var(--text-secondary)")}><X size={16} /></button>
            <button onClick={create} style={iconBtn("var(--success)")}><Save size={16} /></button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center" }}><div className="spinner" style={{ width: 28, height: 28, margin: "0 auto" }} /></div>
      ) : zones.length === 0 ? (
        <p style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>No hay zonas configuradas.</p>
      ) : (
        <div className="glass" style={{ borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {zones.map((z) => {
            const isMP = isMeetingPointZone(z);
            const home = zoneAllowsHomeDelivery(z);
            return (
              <div key={z.id} className={exiting === z.id ? "admin-row-exit-wrapper" : ""}>
                <div
                  className={`admin-row-in${exiting === z.id ? " admin-row-exiting" : ""}`}
                  style={{
                    padding: "0.9rem 1.2rem",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    opacity: z.isActive ? 1 : 0.45,
                  }}
                >
                  {editing === z.id ? (
                    <>
                      <ZoneFormFields form={editForm} setForm={setEditForm} />
                      <div style={{ display: "flex", gap: 6, marginTop: "0.75rem", justifyContent: "flex-end" }}>
                        <button onClick={() => setEditing(null)} style={iconBtn("var(--text-secondary)")}><X size={14} /></button>
                        <button onClick={saveEdit} style={iconBtn("var(--success)")}><Save size={14} /></button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "1rem", alignItems: "center" }}>
                      <div>
                        <p style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {z.name}
                          {isMP && (
                            <span style={badgeStyle("rgba(96,170,255,0.15)", "var(--accent-blue)")}>
                              <MapPin size={11} /> Punto de encuentro
                            </span>
                          )}
                          {home && (
                            <span style={badgeStyle("rgba(34,197,94,0.12)", "var(--success)")}>
                              <Home size={11} /> Domicilio
                            </span>
                          )}
                          {z.isMeetingPoint === null && (
                            <span style={{ ...badgeStyle("rgba(255,255,255,0.04)", "var(--text-muted)"), fontWeight: 500 }}>
                              auto
                            </span>
                          )}
                        </p>
                        {z.meetingPointName && (
                          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>
                            📍 {z.meetingPointName}
                          </p>
                        )}
                        {!z.isActive && <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Inactiva</p>}
                      </div>
                      <p style={{ fontFamily: "var(--font-mono)", color: "var(--accent-blue)" }}>${z.cost}</p>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Orden: {z.sortOrder}</p>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => toggle(z)} title={z.isActive ? "Desactivar" : "Activar"} style={iconBtn(z.isActive ? "var(--warning, #f59e0b)" : "var(--success)")}>
                          <Power size={14} />
                        </button>
                        <button onClick={() => startEdit(z)} style={{ ...iconBtn("var(--accent-blue)"), fontSize: "0.72rem", padding: "0.45rem 0.7rem" }}>Editar</button>
                        <button onClick={() => remove(z)} disabled={!!removing} style={iconBtn("var(--danger)")}>
                          {removing === z.id ? <span className="admin-delete-spinner" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────── Subcomponentes / estilos
function ZoneFormFields({ form, setForm }: { form: CreateForm; setForm: (f: CreateForm) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem", alignItems: "end" }}>
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
      <div>
        <label style={labelStyle}>Punto de encuentro</label>
        <select
          className="admin-input"
          value={form.isMeetingPoint}
          onChange={(e) => setForm({ ...form, isMeetingPoint: e.target.value as CreateForm["isMeetingPoint"] })}
        >
          <option value="auto">Auto (según costo ≤ $100)</option>
          <option value="yes">Sí</option>
          <option value="no">No</option>
        </select>
      </div>
      <div style={{ gridColumn: "span 2" }}>
        <label style={labelStyle}>Lugar del punto de encuentro (opcional)</label>
        <input
          className="admin-input"
          value={form.meetingPointName}
          onChange={(e) => setForm({ ...form, meetingPointName: e.target.value })}
          placeholder="Ej: Plaza del Prado, Estación Tres Cruces…"
        />
      </div>
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

const badgeStyle = (bg: string, color: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 3,
  padding: "2px 7px", borderRadius: 99,
  background: bg, color, fontSize: "0.7rem", fontWeight: 600,
});
