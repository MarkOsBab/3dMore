"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ChevronDown, ChevronUp,
  CheckCircle, Clock, XCircle, Package,
  Home, MapPin, Truck, Tag, CreditCard,
  MessageCircle, Info, Star,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

type OrderStatus = "PENDING" | "APPROVED" | "CONFIRMED" | "READY_FOR_DELIVERY" | "DELIVERED" | "REJECTED" | "CANCELLED";
type ShippingMethod = "HOME_MVD" | "MEETING_POINT" | "HOME_DELIVERY" | "AGENCY" | "PICKUP";

interface OrderItem {
  name?: string;
  quantity?: number;
  variantColorName?: string;
  price?: number;
  isOffer?: boolean;
  discountPercentage?: number;
}

interface ShippingData {
  zoneName?: string;
  meetingPointName?: string;
  address?: string;
  agency?: string;
  notes?: string;
}

interface StatusHistoryEntry {
  status: OrderStatus;
  createdAt: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  promoCode: string | null;
  promoDiscount: number;
  shippingMethod: ShippingMethod;
  shippingCost: number;
  shippingData: ShippingData | null;
  trackingCode: string | null;
  trackingCarrier: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  mpPaymentId: string | null;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  reviewRating: number | null;
  reviewText: string | null;
  reviewImageUrl: string | null;
  statusHistory: StatusHistoryEntry[];
}

type IconComponent = React.FC<{ size?: number; color?: string; style?: React.CSSProperties }>;

const STATUS: Record<OrderStatus, { label: string; detail: string; color: string; bg: string; Icon: IconComponent }> = {
  PENDING:   {
    label: "Pendiente de confirmación",
    detail: "Tu pedido está en espera. Nos comunicaremos a la brevedad para confirmar.",
    color: "var(--warning, #f59e0b)", bg: "rgba(245,158,11,0.1)", Icon: Clock,
  },
  APPROVED:  {
    label: "Pago confirmado — pendiente de confirmación",
    detail: "Tu pago fue acreditado. El pedido está pendiente de confirmación de nuestra parte.",
    color: "#a78bfa", bg: "rgba(167,139,250,0.1)", Icon: CheckCircle,
  },
  CONFIRMED: {
    label: "Pedido en proceso",
    detail: "¡Confirmado! Tu pedido está siendo preparado. Te avisamos cuando esté listo para envío o retiro.",
    color: "var(--accent-blue)", bg: "rgba(59,130,246,0.1)", Icon: Package,
  },
  READY_FOR_DELIVERY: {
    label: "Listo para entrega",
    detail: "Tu pedido está listo. Nos comunicaremos para coordinar la entrega o el retiro.",
    color: "#34d399", bg: "rgba(52,211,153,0.1)", Icon: Truck,
  },
  DELIVERED: {
    label: "Entregado — ¡Completado!",
    detail: "¡Tu pedido fue entregado! Esperamos que lo disfrutes mucho.",
    color: "var(--success)", bg: "rgba(34,197,94,0.1)", Icon: CheckCircle,
  },
  REJECTED:  {
    label: "Pago rechazado",
    detail: "Tu pago fue rechazado. Podés intentar nuevamente o contactarnos por WhatsApp.",
    color: "var(--danger)", bg: "rgba(239,68,68,0.1)", Icon: XCircle,
  },
  CANCELLED: {
    label: "Pedido cancelado",
    detail: "Este pedido fue cancelado. Si tenés dudas, contactanos por WhatsApp.",
    color: "var(--text-muted, #666)", bg: "rgba(255,255,255,0.04)", Icon: XCircle,
  },
};

const SHIPPING: Record<ShippingMethod, { label: string; Icon: IconComponent }> = {
  HOME_MVD:      { label: "Punto de encuentro",         Icon: MapPin },
  MEETING_POINT: { label: "Punto de encuentro",         Icon: MapPin },
  HOME_DELIVERY: { label: "Envío a domicilio",          Icon: Home },
  AGENCY:        { label: "Envío por agencia DAC",      Icon: Truck },
  PICKUP:        { label: "Retiro en domicilio del vendedor", Icon: MapPin },
};

export default function AccountOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<File | null>(null);
  const [reviewPhotoPreview, setReviewPhotoPreview] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/account")
      .then(async (r) => { if (r.ok) { const d = await r.json(); setOrders(d.orders); } })
      .finally(() => setFetching(false));
  }, [user]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    const res = await fetch(`/api/account/orders/${id}/cancel`, { method: "POST" });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "CANCELLED" } : o));
    }
    setCancellingId(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setReviewPhoto(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setReviewPhotoPreview(url);
    } else {
      setReviewPhotoPreview(null);
    }
  };

  const handleSubmitReview = async (orderId: string) => {
    setSubmittingReview(true);
    const fd = new FormData();
    fd.append("rating", String(reviewRating));
    fd.append("text", reviewText);
    if (reviewPhoto) fd.append("photo", reviewPhoto);
    const res = await fetch(`/api/account/orders/${orderId}/review`, { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...data } : o));
      setReviewOrderId(null);
      setReviewText("");
      setReviewRating(5);
      setReviewPhoto(null);
      setReviewPhotoPreview(null);
    }
    setSubmittingReview(false);
  };

  if (loading || fetching) {
    return (
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </main>
    );
  }

  return (
    <main style={{ padding: "3rem 0", minHeight: "85vh" }}>
      <div className="container" style={{ maxWidth: 860 }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          <Link href="/" style={{ color: "var(--text-secondary)" }}>Inicio</Link>
          <span>/</span>
          <Link href="/account" style={{ color: "var(--text-secondary)" }}>Mi cuenta</Link>
          <span>/</span>
          <span style={{ color: "white" }}>Mis pedidos</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <Link href="/account" style={{ color: "var(--text-secondary)", display: "flex" }}>
            <ChevronLeft size={22} />
          </Link>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800 }}>
            Mis <span className="text-gradient">pedidos</span>
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="glass" style={{ textAlign: "center", padding: "4rem 2rem", borderRadius: "var(--radius-xl)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <Package size={44} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
            <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>Todavía no realizaste ningún pedido</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 6 }}>Explorá los productos y hacé tu primera compra.</p>
            <Link href="/" style={{ display: "inline-block", marginTop: "1.5rem" }}>
              <button className="btn-primary" style={{ background: "var(--accent-pink)", fontWeight: 700 }}>Ver productos</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {orders.map((order) => {
              const st = STATUS[order.status];
              const sh = SHIPPING[order.shippingMethod] ?? SHIPPING.PICKUP;
              const isOpen = expanded === order.id;
              const items = Array.isArray(order.items) ? order.items as OrderItem[] : [];
              const sd = order.shippingData as ShippingData | null;
              const fecha = new Date(order.createdAt).toLocaleDateString("es-UY", {
                day: "2-digit", month: "long", year: "numeric",
              });
              const hora = new Date(order.createdAt).toLocaleTimeString("es-UY", {
                hour: "2-digit", minute: "2-digit",
              });

              return (
                <div
                  key={order.id}
                  className="glass"
                  style={{
                    borderRadius: "var(--radius-xl)",
                    border: `1px solid ${isOpen ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
                    borderLeft: `3px solid ${st.color}`,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* Fila resumen — siempre visible */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    style={{ padding: "1.1rem 1.4rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}
                  >
                    {/* Status badge */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 11px", borderRadius: "99px",
                      background: st.bg, color: st.color,
                      fontSize: "0.78rem", fontWeight: 700, flexShrink: 0,
                    }}>
                      <st.Icon size={13} /> {st.label}
                    </div>

                    {/* Fecha + productos */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                        {items.map((i) => `${i.quantity ?? 1}× ${i.name ?? "Producto"}`).join(", ")}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
                        {fecha} a las {hora}
                        {" · "}
                        <sh.Icon size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
                        {sh.label}
                      </p>
                    </div>

                    {/* Total */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1rem" }} className="text-gradient">
                        ${order.total.toFixed(0)} UYU
                      </p>
                      {order.shippingCost > 0 && (
                        <p style={{ fontSize: "0.7rem", color: "var(--warning, #f59e0b)", marginTop: 2 }}>
                          + ${order.shippingCost} envío al recibir
                        </p>
                      )}
                    </div>

                    <span style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>

                  {/* Panel expandido */}
                  {isOpen && (
                    <div className="admin-slide-down" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem 1.4rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                      {/* Banner de estado con mensaje descriptivo */}
                      <div style={{
                        display: "flex", alignItems: "flex-start", gap: "0.75rem",
                        padding: "0.85rem 1rem", borderRadius: "var(--radius-md)",
                        background: st.bg, border: `1px solid ${st.color}33`,
                      }}>
                        <st.Icon size={18} color={st.color} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <p style={{ fontWeight: 700, color: st.color, fontSize: "0.9rem" }}>{st.label}</p>
                          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 3 }}>{st.detail}</p>
                          {order.status === "REJECTED" && (
                            <a
                              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola 3DMORE! Tuve un problema con el pago del pedido #${order.id.slice(0, 8)}`)}`}
                              target="_blank" rel="noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: "0.82rem", color: "var(--whatsapp)", fontWeight: 600 }}
                            >
                              <MessageCircle size={14} /> Contactar por WhatsApp
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Timeline de estados */}
                      {order.statusHistory && order.statusHistory.length > 0 && (
                        <Section title="Seguimiento del pedido">
                          <div style={{ position: "relative", paddingLeft: "1.25rem" }}>
                            {/* línea vertical */}
                            <div style={{
                              position: "absolute", left: "6px", top: "8px",
                              bottom: "8px", width: "2px",
                              background: "rgba(255,255,255,0.08)",
                            }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                              {order.statusHistory.map((entry, idx) => {
                                const isLast = idx === order.statusHistory.length - 1;
                                const s = STATUS[entry.status];
                                const d = new Date(entry.createdAt);
                                const fecha = d.toLocaleDateString("es-UY", { day: "2-digit", month: "short", year: "numeric" });
                                const hora  = d.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
                                return (
                                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                                    {/* dot */}
                                    <div style={{
                                      position: "absolute", left: 0,
                                      width: "14px", height: "14px",
                                      borderRadius: "50%",
                                      background: isLast ? s.color : "rgba(255,255,255,0.15)",
                                      border: `2px solid ${isLast ? s.color : "rgba(255,255,255,0.2)"}`,
                                      flexShrink: 0, marginTop: "2px",
                                    }} />
                                    <div>
                                      <p style={{
                                        fontSize: "0.82rem", fontWeight: isLast ? 700 : 500,
                                        color: isLast ? s.color : "var(--text-primary)",
                                      }}>
                                        {s.label}
                                      </p>
                                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 1 }}>
                                        {fecha} · {hora}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </Section>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                        {/* Productos */}
                        <Section title="Productos">
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {items.map((item, idx) => {
                              const unitPrice = item.isOffer && item.discountPercentage
                                ? (item.price ?? 0) * (1 - item.discountPercentage / 100)
                                : (item.price ?? 0);
                              return (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", gap: "0.5rem" }}>
                                  <span style={{ flex: 1 }}>
                                    <b>{item.quantity ?? 1}×</b> {item.name ?? "Producto"}
                                    {item.variantColorName && (
                                      <span style={{ fontSize: "0.75rem", color: "var(--accent-pink)", marginLeft: 5 }}>({item.variantColorName})</span>
                                    )}
                                  </span>
                                  {unitPrice > 0 && (
                                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", flexShrink: 0 }}>
                                      ${(unitPrice * (item.quantity ?? 1)).toFixed(0)}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </Section>

                        {/* Resumen de pago */}
                        <Section title="Resumen de pago">
                          <Row label="Subtotal" value={`$${order.subtotal.toFixed(0)}`} />
                          {order.promoDiscount > 0 && (
                            <Row
                              label={<span style={{ display: "flex", alignItems: "center", gap: 4 }}><Tag size={12} /> {order.promoCode} ({order.promoDiscount}%)</span>}
                              value={`-$${(order.subtotal - order.total).toFixed(0)}`}
                              color="var(--success)"
                            />
                          )}
                          <Row label={<b>Total pagado online</b>} value={<b>${order.total.toFixed(0)} UYU</b>} />
                          {order.shippingCost > 0 && (
                            <Row
                              label={<span style={{ display: "flex", alignItems: "center", gap: 4 }}><Info size={12} /> Envío (al recibir)</span>}
                              value={`$${order.shippingCost}`}
                              color="var(--warning, #f59e0b)"
                            />
                          )}
                          {order.mpPaymentId && (
                            <p style={{ marginTop: 8, fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                              ID Pago: {order.mpPaymentId}
                            </p>
                          )}
                          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                            Pedido #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                        </Section>
                      </div>

                      {/* Envío */}
                      <Section title="Información de envío">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "4px 11px", borderRadius: "99px",
                            background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)",
                            fontSize: "0.8rem", fontWeight: 600,
                          }}>
                            <sh.Icon size={13} /> {sh.label}
                          </span>
                          {order.shippingCost > 0 ? (
                            <span style={{ fontSize: "0.8rem", color: "var(--warning, #f59e0b)", display: "flex", alignItems: "center", gap: 4 }}>
                              <Info size={13} /> ${order.shippingCost} — se abona al recibir (efectivo o transferencia)
                            </span>
                          ) : (
                            order.shippingMethod !== "PICKUP" && (
                              <span style={{ fontSize: "0.8rem", color: "var(--success)" }}>Sin costo de envío</span>
                            )
                          )}
                        </div>

                        {(order.shippingMethod === "HOME_MVD" || order.shippingMethod === "MEETING_POINT" || order.shippingMethod === "HOME_DELIVERY") && (
                          <div style={{ fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: 3 }}>
                            {sd?.zoneName && <p style={{ color: "var(--text-secondary)" }}>📍 Zona: {sd.zoneName}</p>}
                            {sd?.meetingPointName && order.shippingMethod !== "HOME_DELIVERY" && (
                              <p style={{ fontWeight: 500 }}>Punto de encuentro: {sd.meetingPointName}</p>
                            )}
                            {sd?.address && order.shippingMethod === "HOME_DELIVERY" && <p style={{ fontWeight: 500 }}>{sd.address}</p>}
                            {sd?.notes    && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📝 {sd.notes}</p>}
                          </div>
                        )}
                        {order.shippingMethod === "AGENCY" && (
                          <div style={{ fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: 3 }}>
                            {sd?.agency && <p style={{ fontWeight: 500 }}>Agencia: {sd.agency}</p>}
                            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              El paquete se enviará a la agencia DAC indicada. Recibirás aviso cuando esté disponible para retirar.
                            </p>
                            {sd?.notes && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📝 {sd.notes}</p>}
                          </div>
                        )}
                        {order.shippingMethod === "PICKUP" && (
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <MapPin size={14} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <p style={{ fontSize: "0.88rem" }}>Retiro en domicilio del vendedor.</p>
                              <a
                                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola 3DMORE! Quiero coordinar el retiro del pedido #${order.id.slice(0, 8)}`)}`}
                                target="_blank" rel="noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: "0.82rem", color: "var(--whatsapp)", fontWeight: 600 }}
                              >
                                <MessageCircle size={14} /> Coordinar por WhatsApp
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Tracking */}
                        {order.trackingCode && order.shippingMethod !== "PICKUP" && (
                          <div style={{
                            marginTop: 12,
                            padding: "0.75rem 0.95rem",
                            background: "rgba(59,130,246,0.08)",
                            border: "1px solid rgba(59,130,246,0.25)",
                            borderRadius: "var(--radius-md)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                          }}>
                            <Truck size={16} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: 1 }}>
                                Código de seguimiento{order.trackingCarrier ? ` — ${order.trackingCarrier}` : ""}
                              </p>
                              <p style={{ fontSize: "0.95rem", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: 2, wordBreak: "break-all" }}>
                                {order.trackingCode}
                              </p>
                            </div>
                          </div>
                        )}
                      </Section>

                      {/* CTA si pago rechazado */}
                      {order.status === "REJECTED" && (
                        <Link href="/checkout">
                          <button
                            className="btn-primary"
                            style={{ width: "100%", background: "var(--accent-pink)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          >
                            <CreditCard size={16} /> Reintentar pago
                          </button>
                        </Link>
                      )}

                      {/* Cancelar pedido — solo si PENDING */}
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          style={{
                            width: "100%", padding: "0.7rem",
                            background: "rgba(239,68,68,0.06)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            color: "var(--danger)", borderRadius: "var(--radius-pill)",
                            fontWeight: 600, cursor: cancellingId === order.id ? "not-allowed" : "pointer",
                            opacity: cancellingId === order.id ? 0.6 : 1,
                            fontSize: "0.9rem",
                          }}
                        >
                          {cancellingId === order.id ? "Cancelando…" : "Cancelar pedido"}
                        </button>
                      )}

                      {/* Reseña — solo si DELIVERED */}
                      {order.status === "DELIVERED" && (
                        order.reviewRating !== null ? (
                          <div style={{
                            padding: "1rem", borderRadius: "var(--radius-lg)",
                            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
                          }}>
                            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Tu reseña</p>
                            <div style={{ display: "flex", gap: 3, marginBottom: "0.5rem" }}>
                              {[1,2,3,4,5].map((n) => (
                                <Star key={n} size={16} fill={n <= (order.reviewRating ?? 0) ? "#f59e0b" : "transparent"} color="#f59e0b" />
                              ))}
                            </div>
                            {order.reviewText && <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>{order.reviewText}</p>}
                            {order.reviewImageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={order.reviewImageUrl} alt="foto reseña" style={{ marginTop: "0.75rem", width: "100%", maxWidth: 280, borderRadius: "var(--radius-md)", objectFit: "cover" }} />
                            )}
                          </div>
                        ) : reviewOrderId === order.id ? (
                          <div style={{
                            padding: "1.25rem", borderRadius: "var(--radius-lg)",
                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          }}>
                            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "1rem" }}>Dejar reseña</p>

                            {/* Stars */}
                            <div style={{ display: "flex", gap: 6, marginBottom: "0.85rem" }}>
                              {[1,2,3,4,5].map((n) => (
                                <button key={n} onClick={() => setReviewRating(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                                  <Star size={26} fill={n <= reviewRating ? "#f59e0b" : "transparent"} color="#f59e0b" />
                                </button>
                              ))}
                            </div>

                            {/* Texto */}
                            <textarea
                              className="admin-input"
                              placeholder="Contanos cómo te fue con tu pedido (opcional)…"
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              rows={3}
                              style={{ width: "100%", resize: "vertical", marginBottom: "0.75rem" }}
                            />

                            {/* Foto */}
                            <label style={{ display: "block", marginBottom: "0.75rem" }}>
                              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                                Foto de tu pedido en el casco (opcional)
                              </p>
                              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ fontSize: "0.82rem" }} />
                              {reviewPhotoPreview && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={reviewPhotoPreview} alt="preview" style={{ marginTop: "0.5rem", width: 120, height: 90, objectFit: "cover", borderRadius: "var(--radius-md)" }} />
                              )}
                            </label>

                            <div style={{ display: "flex", gap: "0.6rem" }}>
                              <button
                                onClick={() => handleSubmitReview(order.id)}
                                disabled={submittingReview}
                                className="btn-primary"
                                style={{ flex: 1, background: "var(--accent-pink)", fontWeight: 700, opacity: submittingReview ? 0.6 : 1 }}
                              >
                                {submittingReview ? "Enviando…" : "Enviar reseña"}
                              </button>
                              <button
                                onClick={() => setReviewOrderId(null)}
                                style={{ padding: "0.6rem 1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)", borderRadius: "var(--radius-pill)", cursor: "pointer" }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReviewOrderId(order.id); setReviewRating(5); setReviewText(""); setReviewPhoto(null); setReviewPhotoPreview(null); }}
                            style={{
                              width: "100%", padding: "0.7rem",
                              background: "rgba(245,158,11,0.08)",
                              border: "1px solid rgba(245,158,11,0.3)",
                              color: "#f59e0b", borderRadius: "var(--radius-pill)",
                              fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            }}
                          >
                            <Star size={15} /> Dejar una reseña
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{
        fontSize: "0.68rem", fontWeight: 700, letterSpacing: "1.2px",
        color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.6rem",
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, value, color }: { label: React.ReactNode; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", padding: "3px 0", color: color }}>
      <span style={{ color: color ?? "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}
