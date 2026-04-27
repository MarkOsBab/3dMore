import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

const SECTIONS = [
  { href: "/legal/terminos", label: "Términos y Condiciones" },
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/devoluciones", label: "Cambios y Devoluciones" },
  { href: "/legal/envios", label: "Envíos" },
  { href: "/legal/cookies", label: "Cookies" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: "calc(100vh - 80px)", paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "0.85rem",
            marginBottom: "2rem",
          }}
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "2.5rem",
          }}
          className="legal-grid"
        >
          {/* Sidebar nav */}
          <aside className="legal-sidebar">
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "1rem",
              }}
            >
              Información legal
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {SECTIONS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="legal-nav-link"
                >
                  {s.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <article className="legal-content">{children}</article>
        </div>
      </div>
    </main>
  );
}
