import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";

export default function FailurePage() {
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
      {/* Background glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)", borderRadius: "50%", zIndex: -1 }} />

      <div
        className="glass animate-fade-in-up"
        style={{
          maxWidth: 480,
          width: "100%",
          borderRadius: "var(--radius-xl)",
          padding: "3rem 2.5rem",
          textAlign: "center",
          border: "1px solid rgba(239,68,68,0.2)",
          boxShadow: "0 0 60px rgba(239,68,68,0.08)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239,68,68,0.2), rgba(239,68,68,0.04))",
            border: "1px solid rgba(239,68,68,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <XCircle size={36} color="var(--danger)" />
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.6rem" }}>
          Hubo un problema
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          El pago no pudo completarse. Podés intentarlo nuevamente o contactarnos por WhatsApp.
        </p>

        <div
          style={{
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.12)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "2rem",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "var(--danger)" }}>
            No se realizó ningún cobro. Tus datos están seguros.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/"
            className="btn-primary"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              textDecoration: "none", background: "linear-gradient(135deg, #ff2a85, #3b82f6)",
            }}
          >
            <RefreshCcw size={18} /> Volver a intentar
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.88rem",
            }}
          >
            💬 Pagar por WhatsApp
          </a>
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
