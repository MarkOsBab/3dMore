"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "3dmore_cookie_consent_v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Slight delay to avoid layout shift on first paint
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage no disponible: simplemente no mostramos
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 60,
        maxWidth: 540,
        margin: "0 auto",
        background: "rgba(14, 14, 22, 0.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: "1rem 1.1rem",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.85rem",
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <Cookie size={20} style={{ color: "var(--accent-pink)" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "rgba(255,255,255,0.85)", margin: 0 }}>
          Usamos cookies para mantener tu sesión, tu carrito y mejorar tu experiencia. Al continuar,
          aceptás nuestra{" "}
          <Link href="/legal/cookies" style={{ color: "var(--accent-pink)", textDecoration: "underline" }}>
            política de cookies
          </Link>
          .
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.7rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={accept}
            style={{
              background: "var(--accent-pink)",
              color: "white",
              border: "none",
              borderRadius: "999px",
              padding: "0.45rem 1.1rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Aceptar
          </button>
          <Link
            href="/legal/privacidad"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.45rem 1rem",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Más información
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={accept}
        aria-label="Cerrar"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          padding: 4,
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
