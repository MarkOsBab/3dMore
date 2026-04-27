"use client";

import Link from "next/link";
import { MapPin, Mail, ExternalLink } from "lucide-react";

const SOCIAL = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/3dmore.uy/",
    label: "@3dmore.uy",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    color: "#e1306c",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/3dmore.uy",
    label: "3dmore.uy",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    color: "#1877f2",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@3dmore.uy",
    label: "@3dmore.uy",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
    color: "#ffffff",
  },
  {
    name: "Google",
    href: "https://share.google/VjpnFXh9hE6cCdytI",
    label: "Reseñas Google",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 11h8.533c.044.385.067.78.067 1.184 0 2.734-.98 5.045-2.678 6.6C16.42 20.272 14.368 21 12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9c2.43 0 4.467.87 6.03 2.3L15.772 7.5C14.673 6.476 13.415 5.9 12 5.9 8.703 5.9 6.1 8.503 6.1 11.8c0 3.297 2.603 5.9 5.9 5.9 2.85 0 4.733-1.592 5.367-3.8H12V11z" />
      </svg>
    ),
    color: "#4285f4",
  },
];

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Destacados", href: "/#featured" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Mi cuenta", href: "/account" },
  { label: "Mis pedidos", href: "/account/orders" },
];

const LEGAL_LINKS = [
  { label: "Términos y Condiciones", href: "/legal/terminos" },
  { label: "Privacidad", href: "/legal/privacidad" },
  { label: "Cambios y Devoluciones", href: "/legal/devoluciones" },
  { label: "Envíos", href: "/legal/envios" },
  { label: "Cookies", href: "/legal/cookies" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.98) 100%)",
        padding: "4rem 0 2rem",
        marginTop: "auto",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem",
          marginBottom: "3rem",
        }}
      >
        {/* Brand column */}
        <div>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none",
              marginBottom: "1rem",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icon.jpg"
              alt="3DMORE"
              style={{ height: 48, width: "auto" }}
            />
          </Link>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.88rem",
              lineHeight: 1.7,
              maxWidth: 240,
            }}
          >
            Accesorios para casco de moto impresos en 3D. Personalizá tu casco con diseños únicos hechos en Uruguay.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "1rem",
              color: "var(--text-muted)",
              fontSize: "0.82rem",
            }}
          >
            <MapPin size={13} />
            Uruguay — Envíos a todo el país
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            Navegación
          </p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Social */}
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            Redes sociales
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {SOCIAL.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  textDecoration: "none",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = s.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    flexShrink: 0,
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                >
                  {s.icon}
                </span>
                <span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Contact / Info */}
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            Información
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--whatsapp)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              <ExternalLink size={13} />
              Contacto por WhatsApp
            </a>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.6, marginTop: "0.5rem" }}>
              Envíos a todo Uruguay a través de DAC.
            </p>
          </div>
        </div>

        {/* Legal */}
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            Legal
          </p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: "1.5rem",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            © {year} 3DMORE. Todos los derechos reservados.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Hecho en Uruguay 🇺🇾
          </p>
        </div>
      </div>
    </footer>
  );
}
