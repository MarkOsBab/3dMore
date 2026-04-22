"use client";

import { useState } from "react";
import { createPromoCode, togglePromoCode, deletePromoCode } from "@/lib/actions";
import { Plus, Trash2, Copy, Check, Tag, Search } from "lucide-react";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 12;

interface PromoCode {
  id: string;
  code: string;
  discountPct: number;
  isActive: boolean;
  usageLimit: number | null;
  timesUsed: number;
  validUntil: Date | null;
}
interface Props {
  initialPromos: PromoCode[];
}

export default function PromosClient({ initialPromos }: Props) {
  const confirm = useConfirm();
  const [promos, setPromos] = useState<PromoCode[]>(initialPromos);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exiting, setExiting] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", discountPct: "10", validUntil: "", usageLimit: "100" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "EXPIRED">("ALL");
  const [page, setPage] = useState(1);

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
    setPromos((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, isActive: !x.isActive } : x))
    );
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ message: "¿Seguro que querés eliminar este código promocional?", title: "Eliminar código" })) return;
    setDeleting(id);
    await deletePromoCode(id);
    setDeleting(null);
    setExiting(id);
    setTimeout(() => {
      setPromos((p) => p.filter((x) => x.id !== id));
      setExiting(null);
    }, 520);
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const q = search.toLowerCase().trim();
  const now = new Date();
  const filtered = promos.filter((p) => {
    if (filterStatus === "ACTIVE" && !p.isActive) return false;
    if (filterStatus === "INACTIVE" && p.isActive) return false;
    if (filterStatus === "EXPIRED" && !(p.validUntil && new Date(p.validUntil) < now)) return false;
    if (q && !p.code.toLowerCase().includes(q)) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div
        className="admin-page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
            <Tag size={20} color="var(--accent-pink)" />
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Códigos Promocionales</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {promos.filter((p) => p.isActive).length} activo{promos.filter((p) => p.isActive).length !== 1 ? "s" : ""} · {promos.length} en total
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={primaryBtnStyle}>
          <Plus size={18} /> Nuevo Código
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="glass admin-slide-down"
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            borderTop: "2px solid var(--accent-pink)",
          }}
        >
          <h3 style={{ marginBottom: "1.25rem", fontWeight: 600, fontSize: "1rem" }}>
            Crear código de descuento
          </h3>
          <form
            onSubmit={handleCreate}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "1rem",
              alignItems: "end",
            }}
          >
            <div>
              <label style={labelStyle}>Código</label>
              <input
                style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
                placeholder="RIDER2026"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>% Descuento</label>
              <input
                style={inputStyle}
                type="number"
                min="1"
                max="100"
                value={form.discountPct}
                onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Vence (opcional)</label>
              <input
                style={inputStyle}
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Límite de usos</label>
              <input
                style={inputStyle}
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setShowForm(false)} style={secondaryBtnStyle}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...primaryBtnStyle, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Creando..." : "Crear código"}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Filtros */}
      <div style={{ display: "flex", gap: "0.65rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            className="admin-input"
            placeholder="Buscar código…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 36 }}
          />
        </div>
        {(["ALL", "ACTIVE", "INACTIVE", "EXPIRED"] as const).map((s) => {
          const label = { ALL: "Todos", ACTIVE: "Activos", INACTIVE: "Inactivos", EXPIRED: "Vencidos" }[s];
          const active = filterStatus === s;
          return (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} style={{ padding: "0.4rem 0.9rem", borderRadius: "var(--radius-pill)", border: `1px solid ${active ? "rgba(255,42,133,0.5)" : "rgba(255,255,255,0.08)"}`, background: active ? "rgba(255,42,133,0.08)" : "transparent", color: active ? "var(--accent-pink)" : "var(--text-secondary)", cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 600 : 400 }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div
          className="glass"
          style={{
            padding: "4rem",
            borderRadius: "var(--radius-xl)",
            textAlign: "center",
            color: "var(--text-secondary)",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <Tag size={40} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 500 }}>{q ? "Sin resultados para esa búsqueda" : "Sin códigos promocionales"}</p>
          <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Creá el primero con el botón de arriba.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "0.85rem",
          }}
        >
          {paginated.map((p, i) => {
            const maxUses = p.usageLimit ?? 0;
            const pct = maxUses > 0 ? Math.min(100, (p.timesUsed / maxUses) * 100) : 0;
            const expired = p.validUntil ? new Date(p.validUntil) < new Date() : false;
            return (
              <div key={p.id} className={exiting === p.id ? "admin-row-exit-wrapper" : ""}>
              <div
                className={`glass admin-promo-card admin-row-in${exiting === p.id ? " admin-row-exiting" : ""}`}
                style={{
                  borderRadius: "var(--radius-xl)",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  borderTop: p.isActive ? "2px solid var(--accent-pink)" : "2px solid rgba(255,255,255,0.06)",
                  opacity: p.isActive ? 1 : 0.5,
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div
                      className="text-gradient"
                      style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.1rem" }}
                    >
                      {p.code}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
                      {p.discountPct}% de descuento
                    </div>
                  </div>
                  <button
                    aria-label="Copiar código"
                    onClick={() => copyCode(p.id, p.code)}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: copiedId === p.id ? "var(--success)" : "var(--text-secondary)",
                      padding: 6,
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                    }}
                  >
                    {copiedId === p.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                {maxUses > 0 && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                        marginBottom: 4,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <span>
                        {p.timesUsed} / {p.usageLimit} usos
                      </span>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                      <div
                        style={{
                          height: 5,
                          background: "var(--surface-2)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="admin-progress-bar"
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: pct > 80 ? "var(--danger)" : "var(--accent-neon)",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 2,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.77rem",
                      color: expired ? "var(--danger)" : "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {p.validUntil
                      ? `vence ${new Date(p.validUntil).toLocaleDateString("es-UY")}`
                      : "sin vencimiento"}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Toggle value={p.isActive} onToggle={() => handleToggle(p)} />
                    <button
                      aria-label="Eliminar"
                      onClick={() => handleDelete(p.id)}
                      disabled={!!deleting}
                      style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: deleting === p.id ? "default" : "pointer", display: "inline-flex", alignItems: "center" }}
                    >
                      {deleting === p.id ? <span className="admin-delete-spinner" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
    </div>
  );
}

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={value}
      aria-label={value ? "Desactivar" : "Activar"}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        position: "relative",
        background: value ? "var(--accent-neon)" : "var(--surface-3)",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: value ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-2)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "var(--radius-sm)",
  padding: "0.6rem 0.9rem",
  color: "white",
  width: "100%",
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "var(--text-secondary)",
  display: "block",
  marginBottom: "0.4rem",
  textTransform: "uppercase",
  letterSpacing: "1.5px",
};

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
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "0.65rem 1.25rem",
  borderRadius: "var(--radius-pill)",
  fontWeight: 600,
  cursor: "pointer",
  background: "var(--surface-3)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
};
