"use client";

import Link from "next/link";
import { Package, Tag, Home, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/promos", label: "Promociones", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0a0a0f" }}>
      {/* Sidebar */}
      <aside style={{ width: "240px", flexShrink: 0, backgroundColor: "#111118", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "2rem 1rem", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "2.5rem", padding: "0 0.75rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.25rem" }}>3dMore</p>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Admin Panel</h2>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.75rem 1rem", borderRadius: "8px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "white" : "var(--text-secondary)",
                  background: active ? "linear-gradient(135deg,rgba(255,42,133,0.15),rgba(59,130,246,0.15))" : "transparent",
                  borderLeft: active ? "3px solid var(--accent-pink)" : "3px solid transparent",
                  transition: "all 0.2s",
                  fontSize: "0.95rem",
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", padding: "1rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            🔒 Panel protegido con Basic Auth. No compartas tus credenciales.
          </p>
          <a href="/" target="_blank" style={{ display: "inline-block", marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--accent-blue)", textDecoration: "underline" }}>
            Ver tienda →
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flexGrow: 1, padding: "3rem", overflowY: "auto", maxHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
