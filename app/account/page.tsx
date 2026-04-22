"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, Package, Tag, LogOut, Save,
  CheckCircle, Clock, XCircle, ChevronLeft, Copy,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

type Status = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface OrderRow {
  id: string;
  status: Status;
  total: number;
  shippingMethod: "HOME_MVD" | "AGENCY" | "PICKUP";
  shippingCost: number;
  items: Array<{ name: string; quantity: number; variantColorName?: string }>;
  createdAt: string;
  promoCode: string | null;
}

interface PromoRow {
  code: string;
  discountPct: number;
  validUntil: string | null;
  timesUsed: number;
  usageLimit: number | null;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", documentId: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        documentId: profile.documentId ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/account").then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        setOrders(data.orders);
        setPromos(data.promos);
      }
    });
  }, [user]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  if (loading || !user) {
    return (
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </main>
    );
  }

  return (
    <main style={{ padding: "3rem 0", minHeight: "85vh" }}>
      <div className="container" style={{ maxWidth: 960 }}>
        <Link href="/" style={{ color: "var(--text-secondary)", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ChevronLeft size={15} /> Inicio
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Mi <span className="text-gradient">cuenta</span></h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: 4 }}>{user.email}</p>
          </div>
          <button
            onClick={signOut}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.6rem 1.1rem", background: "transparent", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "0.88rem" }}
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "1.5rem" }}>
          {/* Datos personales */}
          <section className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <UserIcon size={16} color="var(--accent-pink)" /> Datos personales
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Input label="Nombre" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
              <Input label="Apellido" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
              <Input label="Documento" value={form.documentId} onChange={(v) => setForm({ ...form, documentId: v })} />
              <Input label="Teléfono" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </div>
            <button
              onClick={save}
              disabled={saving}
              style={{
                marginTop: "1rem", width: "100%", padding: "0.75rem",
                background: saved ? "var(--success)" : "var(--accent-pink)",
                color: "white", border: "none", borderRadius: "var(--radius-pill)",
                fontWeight: 600, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 6,
                transition: "background 0.3s",
              }}
            >
              {saved ? <><CheckCircle size={16} /> Guardado</> : saving ? "Guardando…" : <><Save size={16} /> Guardar cambios</>}
            </button>
          </section>

          {/* Cupones personales */}
          <section className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Tag size={16} color="var(--accent-pink)" /> Mis cupones
            </h2>
            {promos.length === 0 ? (
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                Hacé tu primera compra para recibir un cupón exclusivo de descuento.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {promos.map((p) => {
                  const used = (p.usageLimit ?? 1) <= p.timesUsed;
                  return (
                    <div key={p.code}
                      style={{
                        padding: "0.75rem 0.9rem", borderRadius: "var(--radius-md)",
                        background: used ? "rgba(255,255,255,0.03)" : "rgba(255,42,133,0.08)",
                        border: `1px solid ${used ? "rgba(255,255,255,0.06)" : "rgba(255,42,133,0.3)"}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        opacity: used ? 0.5 : 1,
                      }}>
                      <div>
                        <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700 }}>{p.code}</code>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
                          {p.discountPct}% OFF {p.validUntil ? `· vence ${new Date(p.validUntil).toLocaleDateString()}` : ""}
                          {used ? " · usado" : ""}
                        </p>
                      </div>
                      {!used && (
                        <button
                          onClick={() => copyCode(p.code)}
                          aria-label="Copiar código"
                          style={{ background: "transparent", color: "var(--accent-pink)", border: "none", cursor: "pointer", padding: 6 }}
                        >
                          {copiedCode === p.code ? <CheckCircle size={16} /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Pedidos */}
        <section className="glass" style={{ marginTop: "1.5rem", padding: "1.5rem", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={16} color="var(--accent-pink)" /> Mis pedidos
            </h2>
            {orders.length > 0 && (
              <Link href="/account/orders" style={{ fontSize: "0.82rem", color: "var(--accent-blue)", fontWeight: 600 }}>
                Ver todos →
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>Aún no realizaste ningún pedido.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {orders.slice(0, 3).map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
              {orders.length > 3 && (
                <Link href="/account/orders" style={{ textAlign: "center", padding: "0.6rem", display: "block", fontSize: "0.85rem", color: "var(--accent-blue)", fontWeight: 600, borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 4 }}>
                  Ver los {orders.length - 3} pedidos restantes →
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  const statusMeta = {
    APPROVED:  { color: "var(--success)",           bg: "rgba(34,197,94,0.1)",  icon: CheckCircle, label: "Aprobado"  },
    PENDING:   { color: "var(--warning, #f59e0b)",  bg: "rgba(245,158,11,0.1)", icon: Clock,       label: "Pendiente" },
    REJECTED:  { color: "var(--danger)",            bg: "rgba(239,68,68,0.1)",  icon: XCircle,     label: "Rechazado" },
    CANCELLED: { color: "var(--text-muted)",        bg: "rgba(255,255,255,0.04)", icon: XCircle,   label: "Cancelado" },
  }[order.status];
  const Icon = statusMeta.icon;

  const shippingLabel = {
    HOME_MVD: "Envío a domicilio",
    AGENCY:   "Envío por agencia",
    PICKUP:   "Retiro en domicilio",
  }[order.shippingMethod];

  return (
    <div style={{ padding: "1rem 1.1rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--text-secondary)" }}>#{order.id.slice(0, 8)}</code>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: "var(--radius-pill)",
              background: statusMeta.bg, color: statusMeta.color,
              fontSize: "0.7rem", fontWeight: 600,
            }}>
              <Icon size={11} /> {statusMeta.label}
            </span>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            {new Date(order.createdAt).toLocaleDateString("es-UY", { day: "2-digit", month: "short", year: "numeric" })} ·  {shippingLabel}
            {order.shippingCost > 0 ? ` (+$${order.shippingCost})` : ""}
          </p>
          <div style={{ marginTop: 6, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            {order.items.map((i, idx) => (
              <span key={idx}>
                {idx > 0 && " · "}
                {i.quantity}× {i.name}{i.variantColorName ? ` (${i.variantColorName})` : ""}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-mono)" }} className="text-gradient">
            ${order.total.toFixed(0)}
          </p>
          {order.promoCode && (
            <p style={{ fontSize: "0.7rem", color: "var(--success)", marginTop: 2 }}>🏷 {order.promoCode}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "1px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4, display: "block" }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input"
      />
    </div>
  );
}
