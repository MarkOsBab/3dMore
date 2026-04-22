"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon, Package, Tag, LogOut, Save,
  CheckCircle, Clock, XCircle, ChevronLeft, Copy,
  MapPin, Home, Star, Trash2, Plus, X, Info, Pencil,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

type Status = "PENDING" | "APPROVED" | "CONFIRMED" | "READY_FOR_DELIVERY" | "DELIVERED" | "REJECTED" | "CANCELLED";

interface SavedAddress {
  id: string;
  label: string | null;
  street: string;
  doorNumber: string;
  corner: string | null;
  neighborhood: string;
  postalCode: string | null;
  zoneId: string;
  zoneName: string;
  isDefault: boolean;
}

interface ShippingZone {
  id: string;
  name: string;
  cost: number;
}

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
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [deletingAddr, setDeletingAddr] = useState<string | null>(null);
  const [savingAddr, setSavingAddr] = useState(false);
  const emptyAddr = { label: "", street: "", doorNumber: "", corner: "", neighborhood: "", postalCode: "", zoneId: "" };
  const [addrForm, setAddrForm] = useState(emptyAddr);

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

  useEffect(() => {
    if (!user) return;
    fetch("/api/shipping/addresses").then(async (r) => { if (r.ok) setAddresses(await r.json()); });
    fetch("/api/shipping/zones").then(async (r) => { if (r.ok) setZones(await r.json()); });
  }, [user]);

  const handleDeleteAddr = async (id: string) => {
    setDeletingAddr(id);
    await fetch(`/api/shipping/addresses/${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    setDeletingAddr(null);
  };

  const handleSaveAddr = async () => {
    if (!addrForm.street || !addrForm.doorNumber || !addrForm.neighborhood || !addrForm.zoneId) return;
    setSavingAddr(true);
    try {
      const zone = zones.find((z) => z.id === addrForm.zoneId);
      const body = { ...addrForm, zoneName: zone?.name ?? "" };
      if (editingAddrId) {
        const res = await fetch(`/api/shipping/addresses/${editingAddrId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) { alert("Error al actualizar la dirección"); return; }
        const updated = await res.json();
        setAddresses((prev) => prev.map((a) => a.id === editingAddrId ? updated : a));
        setEditingAddrId(null);
      } else {
        const res = await fetch("/api/shipping/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) { alert("Error al guardar la dirección"); return; }
        const saved = await res.json();
        setAddresses((prev) => [...prev, saved]);
      }
      setAddrForm(emptyAddr);
      setShowAddrForm(false);
    } finally {
      setSavingAddr(false);
    }
  };

  const canSaveAddr = Boolean(addrForm.street && addrForm.doorNumber && addrForm.neighborhood && addrForm.zoneId);

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

        {/* Direcciones guardadas */}
        <section className="glass" style={{ marginTop: "1.5rem", padding: "1.5rem", borderRadius: "var(--radius-xl)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={16} color="var(--accent-pink)" /> Mis direcciones
            </h2>
            {!showAddrForm && (
              <button
                onClick={() => setShowAddrForm(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.45rem 0.9rem", background: "rgba(255,42,133,0.08)", color: "var(--accent-pink)", border: "1px solid rgba(255,42,133,0.3)", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}
              >
                <Plus size={14} /> Agregar
              </button>
            )}
          </div>

          {/* Lista */}
          {addresses.length === 0 && !showAddrForm && (
            <div style={{ padding: "1.5rem", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-lg)", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <MapPin size={24} color="var(--text-muted)" style={{ marginBottom: 6 }} />
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>No tenés direcciones guardadas</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>Guardá una para agilizar tus próximas compras</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {addresses.map((addr) => (
              <div key={addr.id} style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.9rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "var(--radius-md)", background: addr.isDefault ? "rgba(255,42,133,0.12)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: addr.isDefault ? "var(--accent-pink)" : "var(--text-secondary)" }}>
                  {addr.isDefault ? <Star size={16} /> : <Home size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {addr.label && <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.5px", marginBottom: 2 }}>{addr.label}</p>}
                  <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    {addr.street} {addr.doorNumber}{addr.corner ? ` esq. ${addr.corner}` : ""}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 1 }}>
                    {addr.neighborhood}{addr.postalCode ? ` · CP ${addr.postalCode}` : ""} · <span style={{ color: "var(--text-muted)" }}>{addr.zoneName}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingAddrId(addr.id);
                    setAddrForm({
                      label: addr.label ?? "",
                      street: addr.street,
                      doorNumber: addr.doorNumber,
                      corner: addr.corner ?? "",
                      neighborhood: addr.neighborhood,
                      postalCode: addr.postalCode ?? "",
                      zoneId: addr.zoneId,
                    });
                    setShowAddrForm(true);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.35rem", flexShrink: 0 }}
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeleteAddr(addr.id)}
                  disabled={deletingAddr === addr.id}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.35rem", flexShrink: 0 }}
                  title="Eliminar"
                >
                  {deletingAddr === addr.id
                    ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    : <Trash2 size={15} />}
                </button>
              </div>
            ))}
          </div>

          {/* Formulario nueva dirección */}
          {showAddrForm && (
            <div style={{ marginTop: addresses.length > 0 ? "1rem" : 0, padding: "1.25rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{editingAddrId ? "Editar dirección" : "Nueva dirección"}</p>
                <button onClick={() => { setShowAddrForm(false); setAddrForm(emptyAddr); setEditingAddrId(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                  <X size={17} />
                </button>
              </div>

              <AddrField label="Etiqueta (opcional)" value={addrForm.label} onChange={(v) => setAddrForm({ ...addrForm, label: v })} placeholder="Ej: Casa, Trabajo…" />

              <div>
                <label style={addrLabelStyle}>Zona de entrega</label>
                <select value={addrForm.zoneId} onChange={(e) => setAddrForm({ ...addrForm, zoneId: e.target.value })} className="admin-input">
                  <option value="">Seleccioná una zona</option>
                  {zones.map((z) => <option key={z.id} value={z.id}>{z.name} — ${z.cost}</option>)}
                </select>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <Info size={11} /> El costo de envío se abona al recibir el pedido.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <AddrField label="Calle" value={addrForm.street} onChange={(v) => setAddrForm({ ...addrForm, street: v })} placeholder="Ej: Av. 18 de Julio" />
                <AddrField label="Nro. puerta" value={addrForm.doorNumber} onChange={(v) => setAddrForm({ ...addrForm, doorNumber: v })} placeholder="Ej: 1234 apto 5" />
              </div>
              <AddrField label="Esquina (opcional)" value={addrForm.corner} onChange={(v) => setAddrForm({ ...addrForm, corner: v })} placeholder="Ej: Yaguarón" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <AddrField label="Barrio" value={addrForm.neighborhood} onChange={(v) => setAddrForm({ ...addrForm, neighborhood: v })} placeholder="Ej: Centro" />
                <AddrField label="Código postal (opcional)" value={addrForm.postalCode} onChange={(v) => setAddrForm({ ...addrForm, postalCode: v })} placeholder="Ej: 11000" />
              </div>

              <div style={{ display: "flex", gap: "0.65rem", paddingTop: 4 }}>
                <button
                  onClick={handleSaveAddr}
                  disabled={!canSaveAddr || savingAddr}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.7rem 1.3rem", background: "var(--accent-pink)", color: "white", border: "none", borderRadius: "var(--radius-pill)", cursor: canSaveAddr && !savingAddr ? "pointer" : "default", fontWeight: 600, fontSize: "0.88rem", opacity: !canSaveAddr || savingAddr ? 0.45 : 1 }}
                >
                  {savingAddr ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Guardando…</> : editingAddrId ? "Guardar cambios" : "Guardar dirección"}
                </button>
                <button
                  onClick={() => { setShowAddrForm(false); setAddrForm(emptyAddr); setEditingAddrId(null); }}
                  style={{ padding: "0.7rem 1.1rem", background: "transparent", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-pill)", cursor: "pointer", fontSize: "0.88rem" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  const statusMeta = ({
    APPROVED:           { color: "var(--success)",             bg: "rgba(34,197,94,0.1)",    icon: CheckCircle, label: "Pago confirmado"     },
    PENDING:            { color: "var(--warning, #f59e0b)",    bg: "rgba(245,158,11,0.1)",   icon: Clock,       label: "Pendiente"           },
    CONFIRMED:          { color: "var(--accent-blue)",         bg: "rgba(59,130,246,0.1)",   icon: Package,     label: "En proceso"          },
    READY_FOR_DELIVERY: { color: "#34d399",                    bg: "rgba(52,211,153,0.1)",   icon: CheckCircle, label: "Listo para entrega"  },
    DELIVERED:          { color: "var(--success)",             bg: "rgba(34,197,94,0.1)",    icon: CheckCircle, label: "Entregado"           },
    REJECTED:           { color: "var(--danger)",              bg: "rgba(239,68,68,0.1)",    icon: XCircle,     label: "Rechazado"           },
    CANCELLED:          { color: "var(--text-muted)",          bg: "rgba(255,255,255,0.04)", icon: XCircle,     label: "Cancelado"           },
  } as Record<string, { color: string; bg: string; icon: React.ElementType; label: string }>)[order.status] ?? {
    color: "var(--text-muted)", bg: "rgba(255,255,255,0.04)", icon: Clock, label: order.status,
  };
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

const addrLabelStyle: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 600, letterSpacing: "1px",
  color: "var(--text-secondary)", textTransform: "uppercase",
  marginBottom: 4, display: "block",
};

function AddrField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={addrLabelStyle}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="admin-input" />
    </div>
  );
}
