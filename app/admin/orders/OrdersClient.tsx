"use client";

import { useState } from "react";
import { ShoppingBag, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, RefreshCcw, Home, Package, MapPin, Phone, FileText, Mail, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 10;

type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
type ShippingMethod = "HOME_MVD" | "AGENCY" | "PICKUP";

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
  address?: string;
  agency?: string;
  notes?: string;
}

interface Order {
  id: string;
  mpPaymentId: string | null;
  mpExternalRef: string;
  status: OrderStatus;
  items: unknown;
  subtotal: number;
  total: number;
  promoCode: string | null;
  promoDiscount: number;
  payerEmail: string | null;
  payerName: string | null;
  createdAt: string | Date;
  // campos de envío
  shippingMethod: ShippingMethod;
  shippingCost: number;
  shippingData: ShippingData | null;
  // datos del cliente
  customerFirstName: string | null;
  customerLastName: string | null;
  customerDocument: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
}

const SHIPPING_LABEL: Record<ShippingMethod, { label: string; Icon: React.ElementType }> = {
  HOME_MVD: { label: "Domicilio MVD", Icon: Home },
  AGENCY:   { label: "Agencia DAC",   Icon: Package },
  PICKUP:   { label: "Retiro",        Icon: MapPin },
};

interface Props {
  initialOrders: Order[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  APPROVED:  { label: "Aprobado",  color: "var(--success)",  bg: "rgba(34,197,94,0.12)",   Icon: CheckCircle },
  PENDING:   { label: "Pendiente", color: "var(--warning)",  bg: "rgba(245,158,11,0.12)",  Icon: Clock },
  REJECTED:  { label: "Rechazado", color: "var(--danger)",   bg: "rgba(239,68,68,0.12)",   Icon: XCircle },
  CANCELLED: { label: "Cancelado", color: "var(--danger)",   bg: "rgba(239,68,68,0.12)",   Icon: XCircle },
};

export default function OrdersClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setRefreshing(false);
  };

  const q = search.toLowerCase().trim();
  const filtered = orders.filter((o) => {
    if (filter !== "ALL" && o.status !== filter) return false;
    if (!q) return true;
    const name = `${o.customerFirstName ?? ""} ${o.customerLastName ?? ""} ${o.payerName ?? ""}`.toLowerCase();
    const email = (o.customerEmail ?? o.payerEmail ?? "").toLowerCase();
    return name.includes(q) || email.includes(q) || o.id.toLowerCase().startsWith(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    ALL:       orders.length,
    APPROVED:  orders.filter((o) => o.status === "APPROVED").length,
    PENDING:   orders.filter((o) => o.status === "PENDING").length,
    REJECTED:  orders.filter((o) => o.status === "REJECTED").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
            <ShoppingBag size={20} color="var(--accent-pink)" />
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Pedidos</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {counts.APPROVED} aprobado{counts.APPROVED !== 1 ? "s" : ""} · {counts.PENDING} pendiente{counts.PENDING !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.6rem 1.1rem", borderRadius: "var(--radius-pill)",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "white", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500,
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          <RefreshCcw size={15} style={{ animation: refreshing ? "spin 0.8s linear infinite" : undefined }} />
          Actualizar
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
        <input
          className="admin-input"
          placeholder="Buscar por nombre, email o ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["ALL", "APPROVED", "PENDING", "REJECTED", "CANCELLED"] as const).map((s) => {
          const active = filter === s;
          const cfg = s !== "ALL" ? STATUS_CONFIG[s] : null;
          return (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              style={{
                padding: "0.4rem 0.9rem", borderRadius: "var(--radius-pill)",
                border: `1px solid ${active ? (cfg?.color ?? "rgba(255,255,255,0.3)") : "rgba(255,255,255,0.08)"}`,
                background: active ? (cfg?.bg ?? "rgba(255,255,255,0.08)") : "transparent",
                color: active ? (cfg?.color ?? "white") : "var(--text-secondary)",
                cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 600 : 400,
                transition: "all 0.18s",
              }}
            >
              {s === "ALL" ? "Todos" : STATUS_CONFIG[s].label} ({counts[s]})
            </button>
          );
        })}
      </div>

      {/* Lista de pedidos */}
      {filtered.length === 0 ? (
        <div
          className="glass"
          style={{ textAlign: "center", padding: "4rem", borderRadius: "var(--radius-xl)", color: "var(--text-secondary)", border: "1px dashed rgba(255,255,255,0.1)" }}
        >
          <ShoppingBag size={40} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 500 }}>{q ? "Sin resultados para esa búsqueda" : `Sin pedidos${filter !== "ALL" ? ` ${STATUS_CONFIG[filter].label.toLowerCase()}s` : ""}`}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {paginated.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status];
            const isOpen = expanded === order.id;
            const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
            const date = new Date(order.createdAt).toLocaleDateString("es-UY", {
              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="glass admin-row-in"
                style={{
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${cfg.color}`,
                  overflow: "hidden",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                {/* Row principal */}
                <div
                  style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                >
                  {/* Badge status */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.3rem 0.7rem", borderRadius: "99px",
                    background: cfg.bg, color: cfg.color,
                    fontSize: "0.75rem", fontWeight: 600, flexShrink: 0,
                  }}>
                    <cfg.Icon size={13} />
                    {cfg.label}
                  </div>

                  {/* Info */}
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        #{order.id.slice(0, 8)}
                      </span>
                      {(order.customerFirstName || order.payerName) && (
                        <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                          {order.customerFirstName ? `${order.customerFirstName} ${order.customerLastName ?? ""}`.trim() : order.payerName}
                        </span>
                      )}
                      {order.shippingMethod && (() => {
                        const sm = SHIPPING_LABEL[order.shippingMethod];
                        return (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.72rem", color: "var(--accent-blue)", background: "rgba(59,130,246,0.1)", padding: "2px 7px", borderRadius: "99px" }}>
                            <sm.Icon size={11} /> {sm.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>
                      {date} · {items.length} producto{items.length !== 1 ? "s" : ""}
                      {order.promoCode ? ` · 🏷 ${order.promoCode}` : ""}
                      {order.shippingData?.address ? ` · 📍 ${order.shippingData.address}` : ""}
                      {order.shippingData?.agency ? ` · ${order.shippingData.agency}` : ""}
                    </p>
                  </div>

                  {/* Total */}
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem", flexShrink: 0 }}>
                    ${order.total.toFixed(0)} UYU
                  </span>

                  {/* Toggle */}
                  <span style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>

                {/* Detalle expandido */}
                {isOpen && (
                  <div
                    className="admin-slide-down"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}
                  >
                    {/* Items */}
                    <div>
                      <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "1px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Productos</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {items.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                            <span>
                              {item.quantity ?? 1}× {item.name ?? "Producto"}
                              {item.variantColorName ? <span style={{ color: "var(--accent-pink)", marginLeft: 6, fontSize: "0.78rem" }}>({item.variantColorName})</span> : null}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totales + datos pagador */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "1px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Pago</p>
                        <p style={{ fontSize: "0.85rem" }}>Subtotal: <span style={{ fontFamily: "var(--font-mono)" }}>${order.subtotal.toFixed(0)}</span></p>
                        {order.promoDiscount > 0 && (
                          <p style={{ fontSize: "0.85rem", color: "var(--success)" }}>
                            Descuento ({order.promoDiscount}%): -${(order.subtotal - order.total).toFixed(0)}
                          </p>
                        )}
                        <p style={{ fontSize: "0.9rem", fontWeight: 700, marginTop: 4 }}>
                          Total: <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-blue)" }}>${order.total.toFixed(0)} UYU</span>
                        </p>
                        {order.mpPaymentId && (
                          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                            MP: {order.mpPaymentId}
                          </p>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "1px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Cliente</p>
                        {(order.customerFirstName || order.payerName) && (
                          <p style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                            {order.customerFirstName ? `${order.customerFirstName} ${order.customerLastName ?? ""}`.trim() : order.payerName}
                          </p>
                        )}
                        {order.customerDocument && (
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <FileText size={12} /> CI: {order.customerDocument}
                          </p>
                        )}
                        {order.customerPhone && (
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <Phone size={12} />
                            <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                              style={{ color: "var(--whatsapp)", textDecoration: "none" }}>
                              {order.customerPhone}
                            </a>
                          </p>
                        )}
                        {(order.customerEmail ?? order.payerEmail) && (
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <Mail size={12} /> {order.customerEmail ?? order.payerEmail}
                          </p>
                        )}
                        {!order.customerFirstName && !order.payerName && (
                          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>No disponible aún</p>
                        )}
                      </div>
                    </div>

                    {/* Envío */}
                    {order.shippingMethod && (() => {
                      const sm = SHIPPING_LABEL[order.shippingMethod];
                      const sd = order.shippingData;
                      return (
                        <div style={{ paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "1px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Envío</p>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", flexWrap: "wrap" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.82rem", fontWeight: 600, color: "var(--accent-blue)", background: "rgba(59,130,246,0.1)", padding: "4px 10px", borderRadius: "99px" }}>
                              <sm.Icon size={13} /> {sm.label}
                            </span>
                            {order.shippingCost > 0 && (
                              <span style={{ fontSize: "0.82rem", color: "var(--warning, #f59e0b)", fontFamily: "var(--font-mono)" }}>
                                ${order.shippingCost} al recibir
                              </span>
                            )}
                            {order.shippingMethod === "PICKUP" && (
                              <span style={{ fontSize: "0.82rem", color: "var(--success)" }}>Sin costo</span>
                            )}
                          </div>
                          {sd?.zoneName && <p style={{ fontSize: "0.82rem", marginTop: 4, color: "var(--text-secondary)" }}>📍 Zona: {sd.zoneName}</p>}
                          {sd?.address  && <p style={{ fontSize: "0.85rem", marginTop: 4 }}>{sd.address}</p>}
                          {sd?.agency   && <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Agencia: {sd.agency}</p>}
                          {sd?.notes    && <p style={{ fontSize: "0.78rem", marginTop: 4, color: "var(--text-muted)" }}>📝 {sd.notes}</p>}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
    </div>
  );
}
