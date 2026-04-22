"use client";

import { useEffect, useState } from "react";
import { Star, RefreshCcw, MessageSquare, User, Image, ImageOff } from "lucide-react";

interface Review {
  id: string;
  reviewRating: number;
  reviewText: string | null;
  reviewImageUrl: string | null;
  reviewShowImage: boolean;
  updatedAt: string;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerEmail: string | null;
  payerName: string | null;
  payerEmail: string | null;
  items: unknown;
  total: number;
  status: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= rating ? "#f59e0b" : "transparent"}
          color="#f59e0b"
        />
      ))}
    </div>
  );
}

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    const res = await fetch("/api/admin/reviews");
    if (res.ok) setReviews(await res.json());
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const toggleShowImage = async (r: Review) => {
    setTogglingId(r.id);
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, reviewShowImage: !r.reviewShowImage }),
    });
    if (res.ok) {
      setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, reviewShowImage: !r.reviewShowImage } : x));
    }
    setTogglingId(null);
  };

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.reviewRating, 0) / reviews.length
    : 0;

  const dist = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => r.reviewRating === n).length,
  }));

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
            <Star size={20} color="#f59e0b" fill="#f59e0b" />
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Reseñas</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {reviews.length} reseña{reviews.length !== 1 ? "s" : ""} de clientes
          </p>
        </div>
        <button
          onClick={() => load(true)}
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

      {reviews.length === 0 ? (
        <div className="glass" style={{
          textAlign: "center", padding: "4rem 2rem",
          borderRadius: "var(--radius-xl)", border: "1px dashed rgba(255,255,255,0.1)",
          color: "var(--text-secondary)",
        }}>
          <MessageSquare size={40} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 600 }}>Todavía no hay reseñas</p>
          <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Aparecerán cuando los clientes califiquen sus pedidos entregados.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="glass" style={{
            padding: "1.5rem", borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.75rem",
            display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", alignItems: "center",
          }}>
            {/* Promedio */}
            <div style={{ textAlign: "center", minWidth: 110 }}>
              <p style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, color: "#f59e0b" }}>
                {avg.toFixed(1)}
              </p>
              <Stars rating={Math.round(avg)} />
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 6 }}>
                de {reviews.length} reseña{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Distribución */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {dist.map(({ star, count }) => {
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", minWidth: 14 }}>{star}</span>
                    <Star size={11} fill="#f59e0b" color="#f59e0b" />
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 4, transition: "width 0.4s ease" }} />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", minWidth: 18 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map((r, i) => {
              const name = r.customerFirstName
                ? `${r.customerFirstName} ${r.customerLastName ?? ""}`.trim()
                : (r.payerName ?? "Cliente");
              const email = r.customerEmail ?? r.payerEmail ?? "";
              const date = new Date(r.updatedAt).toLocaleDateString("es-UY", {
                day: "2-digit", month: "short", year: "numeric",
              });
              const items = (Array.isArray(r.items) ? r.items : []) as Array<{ name?: string; quantity?: number }>;

              return (
                <div
                  key={r.id}
                  className="glass admin-row-in"
                  style={{
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: `3px solid #f59e0b`,
                    padding: "1.25rem 1.5rem",
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  {/* Top row: cliente + rating + fecha */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: r.reviewText || r.reviewImageUrl ? "1rem" : 0 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <User size={17} color="#f59e0b" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.93rem" }}>{name}</span>
                        <Stars rating={r.reviewRating} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          #{r.id.slice(0, 8)}
                        </span>
                      </div>

                      {email && (
                        <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>{email}</p>
                      )}

                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 3 }}>
                        {date}
                        {items.length > 0 && (
                          <> · {items.map((it) => `${it.quantity ?? 1}× ${it.name ?? "Producto"}`).join(", ")}</>
                        )}
                        <> · <span style={{ fontFamily: "var(--font-mono)" }}>${r.total.toFixed(0)} UYU</span></>
                      </p>
                    </div>
                  </div>

                  {/* Contenido de la reseña */}
                  {(r.reviewText || r.reviewImageUrl) && (
                    <div style={{
                      paddingTop: "0.85rem",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start",
                    }}>
                      {r.reviewText && (
                        <p style={{
                          flex: 1, minWidth: 200,
                          fontSize: "0.9rem", color: "var(--text-secondary)",
                          lineHeight: 1.6, fontStyle: "italic",
                        }}>
                          &ldquo;{r.reviewText}&rdquo;
                        </p>
                      )}
                      {r.reviewImageUrl && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "center" }}>
                          <button
                            onClick={() => setLightbox(r.reviewImageUrl!)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.reviewImageUrl}
                              alt="foto pedido"
                              style={{
                                width: 110, height: 90,
                                objectFit: "cover",
                                borderRadius: "var(--radius-md)",
                                border: `2px solid ${r.reviewShowImage ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                                transition: "opacity 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            />
                          </button>
                          <button
                            onClick={() => toggleShowImage(r)}
                            disabled={togglingId === r.id}
                            title={r.reviewShowImage ? "Ocultar imagen en home" : "Mostrar imagen en home"}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "3px 9px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 600,
                              cursor: togglingId === r.id ? "default" : "pointer",
                              border: `1px solid ${r.reviewShowImage ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.12)"}`,
                              background: r.reviewShowImage ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                              color: r.reviewShowImage ? "var(--success)" : "var(--text-muted)",
                              opacity: togglingId === r.id ? 0.5 : 1,
                              transition: "all 0.2s",
                            }}
                          >
                            {r.reviewShowImage
                              ? <><Image size={11} /> Visible</>
                              : <><ImageOff size={11} /> Oculta</>}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="foto reseña"
            style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: "var(--radius-lg)" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
