"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";

export default function CartToast() {
  const { lastAdded, setIsCartOpen } = useCart();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastAdded) return;

    // Reiniciar timers al agregar un nuevo producto
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setExiting(false);
    setVisible(true);

    exitTimer.current = setTimeout(() => setExiting(true), 2600);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 3000);

    return () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [lastAdded]);

  if (!visible || !lastAdded) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 200,
        animation: exiting
          ? "cart-toast-out 0.4s cubic-bezier(0.4,0,1,1) forwards"
          : "cart-toast-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
        background: "rgba(15, 15, 22, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 42, 133, 0.35)",
        borderRadius: "var(--radius-xl)",
        padding: "0.875rem 1.125rem",
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        minWidth: 270,
        maxWidth: 340,
        boxShadow: "0 8px 40px rgba(255, 42, 133, 0.18), 0 2px 12px rgba(0,0,0,0.5)",
      }}
    >
      {/* Imagen del producto o icono fallback */}
      {lastAdded.imageUrl ? (
        <img
          src={lastAdded.imageUrl}
          alt=""
          style={{
            width: 52,
            height: 52,
            borderRadius: "var(--radius-md)",
            objectFit: "cover",
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      ) : (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "var(--radius-md)",
            background: "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShoppingCart size={22} color="var(--accent-pink)" />
        </div>
      )}

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            marginBottom: "0.2rem",
          }}
        >
          <CheckCircle size={13} color="var(--success)" />
          <span
            style={{
              fontSize: "0.68rem",
              color: "var(--success)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
            }}
          >
            Agregado al carrito
          </span>
        </div>
        <p
          style={{
            fontSize: "0.92rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lastAdded.name}
        </p>
      </div>

      {/* Botón ver carrito */}
      <button
        onClick={() => setIsCartOpen(true)}
        style={{
          flexShrink: 0,
          background: "var(--accent-neon)",
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: "0.4rem 0.8rem",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "white",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Ver
      </button>
    </div>
  );
}
