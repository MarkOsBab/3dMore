// Dashboard page — reads live counts from Prisma
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Tag, Layers, Flame, ArrowRight, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

interface StatCardProps {
  label: string;
  value: number | string;
  hint: string;
  accent: string;
  Icon: React.ComponentType<{ size?: number }>;
  delay?: string;
}

function StatCard({ label, value, hint, accent, Icon, delay = "0s" }: StatCardProps) {
  return (
    <div
      className="glass admin-stat-card animate-fade-in-up"
      style={{
        borderRadius: "var(--radius-xl)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
        overflow: "hidden",
        animationDelay: delay,
        borderTop: `2px solid ${accent}`,
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: `linear-gradient(to bottom, ${accent}18, transparent)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.25rem",
        }}
      >
        <span className="ds-label" style={{ paddingTop: 2 }}>{label}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            background: `${accent}20`,
            border: `1px solid ${accent}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
      <div
        style={{
          fontSize: "2.6rem",
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: "0.4rem",
          fontVariantNumeric: "tabular-nums",
          color: "var(--text-primary)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{hint}</div>
    </div>
  );
}

interface QuickLinkProps {
  href: string;
  label: string;
  description: string;
  Icon: React.ComponentType<{ size?: number }>;
  accent: string;
  delay?: string;
}

function QuickLink({ href, label, description, Icon, accent, delay = "0s" }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="glass admin-quick-link animate-fade-in-up"
      style={{
        borderRadius: "var(--radius-xl)",
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        textDecoration: "none",
        border: "1px solid rgba(255,255,255,0.06)",
        animationDelay: delay,
        // Pass accent as CSS var so pure-CSS hover can use it
        ["--ql-accent" as string]: accent,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "var(--radius-md)",
          background: `${accent}18`,
          border: `1px solid ${accent}35`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ flexGrow: 1 }}>
        <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{description}</div>
      </div>
      <ArrowRight size={16} color="var(--text-muted)" />
    </Link>
  );
}

export default async function AdminDashboard() {
  const [productCount, offerCount, activePromoCount, variantCount] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isOffer: true } }),
    prisma.promoCode.count({ where: { isActive: true } }),
    prisma.productVariant.count(),
  ]);

  return (
    <div>
      {/* Header */}
      <div
        className="animate-fade-in-up"
        style={{ marginBottom: "2rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
          <BarChart3 size={20} color="var(--accent-pink)" />
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Dashboard</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Resumen general del emprendimiento · precios en UYU
        </p>
      </div>

      {/* Stat cards */}
      <div
        className="admin-stat-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Productos" value={productCount} hint="en catálogo"
          accent="var(--accent-blue)" Icon={Package} delay="0.05s"
        />
        <StatCard
          label="En oferta" value={offerCount} hint="descuento activo"
          accent="var(--accent-pink)" Icon={Flame} delay="0.1s"
        />
        <StatCard
          label="Códigos activos" value={activePromoCount} hint="promociones vigentes"
          accent="var(--success)" Icon={Tag} delay="0.15s"
        />
        <StatCard
          label="Variantes" value={variantCount} hint="opciones de color"
          accent="var(--warning)" Icon={Layers} delay="0.2s"
        />
      </div>

      {/* Quick access */}
      <div
        className="animate-fade-in-up"
        style={{
          marginBottom: "0.75rem",
          animationDelay: "0.25s",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.68rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontWeight: 600,
          }}
        >
          Acceso rápido
        </span>
        <div style={{ flexGrow: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem" }}>
        <QuickLink
          href="/admin/products"
          label="Gestionar productos"
          description="Agregar, editar y publicar variantes"
          Icon={Package}
          accent="var(--accent-blue)"
          delay="0.28s"
        />
        <QuickLink
          href="/admin/promos"
          label="Códigos de descuento"
          description="Crear y monitorear campañas"
          Icon={Tag}
          accent="var(--accent-pink)"
          delay="0.33s"
        />
      </div>
    </div>
  );
}

