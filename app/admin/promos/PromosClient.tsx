"use client";

import { useState } from "react";
import { createPromoCode, togglePromoCode, deletePromoCode } from "@/lib/actions";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface PromoCode {
  id: string; code: string; discountPct: number; isActive: boolean;
  usageLimit: number | null; timesUsed: number; validUntil: Date | null;
}
interface Props { initialPromos: PromoCode[] }

export default function PromosClient({ initialPromos }: Props) {
  const [promos, setPromos] = useState<PromoCode[]>(initialPromos);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: "", discountPct: "10", validUntil: "", usageLimit: "100" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountPct) return;
    setLoading(true);
    try {
      const promo = await createPromoCode({
        code: form.code,
        discountPct: parseFloat(form.discountPct),
        validUntil: form.validUntil || undefined,
        usageLimit: parseInt(form.usageLimit) || 100,
      });
      setPromos((p) => [promo as any, ...p]);
      setShowForm(false);
      setForm({ code: "", discountPct: "10", validUntil: "", usageLimit: "100" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (p: PromoCode) => {
    await togglePromoCode(p.id, !p.isActive);
    setPromos((prev) => prev.map((x) => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este código?")) return;
    await deletePromoCode(id);
    setPromos((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Códigos Promocionales</h1>
        <button onClick={() => setShowForm(!showForm)} style={primaryBtnStyle}>
          <Plus size={18} /> Nuevo Código
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass" style={{ borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem", borderLeft: "3px solid var(--accent-pink)" }}>
          <h3 style={{ marginBottom: "1.5rem", fontWeight: 600 }}>Crear Código de Descuento</h3>
          <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Código</label>
              <input style={inputStyle} placeholder="RIDER2026" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
            </div>
            <div>
              <label style={labelStyle}>% Descuento</label>
              <input style={inputStyle} type="number" min="1" max="100" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Vence (opcional)</label>
              <input style={inputStyle} type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Límite de usos</label>
              <input style={inputStyle} type="number" min="1" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
              <button type="button" onClick={() => setShowForm(false)} style={secondaryBtnStyle}>Cancelar</button>
              <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Creando..." : "Crear Código"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Código", "Descuento", "Usos", "Vencimiento", "Estado", ""].map((h) => (
                <th key={h} style={{ padding: "1rem 1.25rem", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>Sin códigos promocionales aún.</td></tr>
            )}
            {promos.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: p.isActive ? 1 : 0.5 }}>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <code style={{ background: "rgba(255,255,255,0.08)", padding: "3px 10px", borderRadius: "6px", fontFamily: "monospace", fontWeight: 700, color: "var(--accent-pink)" }}>{p.code}</code>
                </td>
                <td style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>{p.discountPct}%</td>
                <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>{p.timesUsed} / {p.usageLimit ?? "∞"}</td>
                <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                  {p.validUntil ? new Date(p.validUntil).toLocaleDateString("es-UY") : "Sin límite"}
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600, background: p.isActive ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", color: p.isActive ? "#22c55e" : "var(--text-secondary)" }}>
                    {p.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button title={p.isActive ? "Desactivar" : "Activar"} onClick={() => handleToggle(p)} style={iconBtnStyle}>
                      {p.isActive ? <ToggleRight size={18} style={{ color: "#22c55e" }} /> : <ToggleLeft size={18} />}
                    </button>
                    <button title="Eliminar" onClick={() => handleDelete(p.id)} style={{ ...iconBtnStyle, color: "#ef4444" }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "white", width: "100%", fontSize: "0.95rem", outline: "none" };
const labelStyle: React.CSSProperties = { fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" };
const primaryBtnStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.25rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "linear-gradient(135deg, #ff2a85, #3b82f6)", border: "none", color: "white" };
const secondaryBtnStyle: React.CSSProperties = { padding: "0.65rem 1.25rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "white" };
const iconBtnStyle: React.CSSProperties = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.4rem 0.5rem", color: "white", cursor: "pointer", display: "flex", alignItems: "center" };
