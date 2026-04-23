import Link from "next/link";
import { CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pago realizado",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glows */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)", borderRadius: "50%", zIndex: -1 }} />

      <div
        className="glass animate-fade-in-up"
        style={{
          maxWidth: 480,
          width: "100%",
          borderRadius: "var(--radius-xl)",
          padding: "3rem 2.5rem",
          textAlign: "center",
          border: "1px solid rgba(34,197,94,0.2)",
          boxShadow: "0 0 60px rgba(34,197,94,0.1)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.25), rgba(34,197,94,0.05))",
            border: "1px solid rgba(34,197,94,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <CheckCircle size={36} color="var(--success)" />
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.6rem" }}>
          ¡Pago exitoso!
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          Tu pedido fue recibido y está siendo procesado. Te contactaremos pronto con los detalles del envío.
        </p>

        <div
          style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "2rem",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "var(--success)" }}>
            Revisá tu email — Mercado Pago te envió la confirmación del pago.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/"
            className="btn-primary"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              textDecoration: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: "0 4px 20px rgba(34,197,94,0.25)",
            }}
          >
            <ShoppingBag size={18} /> Seguir comprando
          </Link>
          <Link
            href="/"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.88rem",
            }}
          >
            <ArrowLeft size={15} /> Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
