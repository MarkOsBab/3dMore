"use client";

import Link from "next/link";
import { Package, Tag, LayoutDashboard, ExternalLink, ShieldCheck, ShoppingBag, Truck, Layers, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categories", label: "Categorías", icon: Layers },
  { href: "/admin/promos", label: "Promociones", icon: Tag },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/shipping", label: "Envíos", icon: Truck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-dark)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "256px",
          flexShrink: 0,
          backgroundColor: "#0d0d14",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "0",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: "1.75rem 1.5rem 1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--radius-sm)",
                background: "var(--accent-neon)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                flexShrink: 0,
              }}
            >
              3D
            </div>
            <div>
              <div
                className="text-gradient"
                style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "1px", lineHeight: 1 }}
              >
                3DMORE
              </div>
              <div
                style={{
                  fontSize: "0.62rem",
                  color: "var(--text-muted)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.15rem", flexGrow: 1 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`admin-nav-item${active ? " active" : ""}`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            style={{
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1rem",
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.15)",
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <ShieldCheck size={14} color="var(--success)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Sesión activa
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.6rem 1rem", width: "100%",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem", color: "var(--danger)",
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
              cursor: "pointer", marginBottom: "0.5rem",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              background: "var(--surface-1)",
              border: "1px solid rgba(255,255,255,0.06)",
              transition: "background 0.18s ease, color 0.18s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
              (e.currentTarget as HTMLElement).style.color = "white";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-1)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            <ExternalLink size={14} />
            Ver tienda
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flexGrow: 1,
          overflowY: "auto",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flexGrow: 1, padding: "2.5rem 3rem", maxWidth: 1100 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

