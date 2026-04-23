"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, User, LogOut, Package, LogIn, Menu, X } from "lucide-react";
import { useCart } from "../lib/CartContext";
import { useAuth } from "../lib/AuthContext";

export default function Navbar() {
  const { items, setIsCartOpen, lastAdded } = useCart();
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const [badgePulse, setBadgePulse] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lastAdded) return;
    setBadgePulse(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setBadgePulse(true));
    });
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setBadgePulse(false), 500);
    return () => { if (pulseTimer.current) clearTimeout(pulseTimer.current); };
  }, [lastAdded]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close mobile nav on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const displayName = profile?.firstName
    ? profile.firstName
    : (user?.user_metadata?.name as string | undefined)?.split(" ")[0] ?? "Mi cuenta";

  const cartButton = (
    <button
      aria-label="Abrir carrito"
      style={{ background: "transparent", color: "white", position: "relative", padding: 4 }}
      onClick={() => setIsCartOpen(true)}
    >
      <ShoppingCart size={24} />
      {totalItems > 0 && (
        <span
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            background: "var(--accent-pink)",
            color: "white",
            fontSize: "0.72rem",
            fontWeight: 700,
            width: 20,
            height: 20,
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            animation: badgePulse ? "badge-bounce 0.45s cubic-bezier(0.34,1.56,0.64,1)" : undefined,
          }}
        >
          {totalItems}
        </span>
      )}
    </button>
  );

  return (
    <>
      <nav
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: "var(--z-nav)" as unknown as number,
          padding: "1rem 0",
        }}
      >
        <div
          className="container"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icon.jpg"
              alt="3DMORE logo"
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--radius-sm)",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <span className="text-gradient" style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "2px" }}>
              3DMORE
            </span>
          </Link>

          {/* Desktop nav links — hidden on mobile via CSS */}
          <div className="nav-desktop-links" style={{ gap: "1.5rem", alignItems: "center" }}>
            <Link href="/catalogo" style={{ fontWeight: 500, transition: "color 0.2s" }}>
              Catálogo
            </Link>
            <Link href="/#featured" style={{ fontWeight: 500, transition: "color 0.2s" }}>
              Destacados
            </Link>

            {!loading && (
              user ? (
                <div ref={menuRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Mi cuenta"
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      background: "transparent", color: "white", padding: "0.3rem 0.6rem",
                      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "var(--radius-pill)",
                      cursor: "pointer",
                    }}
                  >
                    {profile?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatarUrl}
                        alt=""
                        style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: "var(--accent-pink)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 700,
                      }}>
                        {(displayName[0] ?? "U").toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{displayName}</span>
                  </button>

                  {menuOpen && (
                    <div
                      className="glass admin-modal-enter"
                      style={{
                        position: "absolute", top: "calc(100% + 0.6rem)", right: 0,
                        minWidth: 220, borderRadius: "var(--radius-lg)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: "0.5rem", display: "flex", flexDirection: "column", gap: 2,
                      }}
                    >
                      <div style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
                        <p style={{ fontSize: "0.82rem", fontWeight: 600 }}>{displayName}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{user.email}</p>
                      </div>
                      <MenuLink href="/account" icon={User} label="Mi perfil" onClick={() => setMenuOpen(false)} />
                      <MenuLink href="/account/orders" icon={Package} label="Mis pedidos" onClick={() => setMenuOpen(false)} />
                      <button
                        onClick={() => { setMenuOpen(false); signOut(); }}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.6rem",
                          padding: "0.6rem 0.8rem", background: "transparent",
                          color: "var(--text-secondary)", border: "none", cursor: "pointer",
                          borderRadius: "var(--radius-sm)", textAlign: "left", width: "100%",
                          fontSize: "0.85rem",
                        }}
                      >
                        <LogOut size={15} />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.45rem",
                    padding: "0.45rem 0.95rem", borderRadius: "var(--radius-pill)",
                    background: "rgba(255,255,255,0.06)", color: "white",
                    border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
                    fontSize: "0.85rem", fontWeight: 500,
                  }}
                >
                  <LogIn size={15} />
                  Ingresar
                </button>
              )
            )}

            {cartButton}
          </div>

          {/* Mobile controls: cart + hamburger — hidden on desktop via CSS */}
          <div className="nav-mobile-controls" style={{ alignItems: "center", gap: "0.5rem" }}>
            {cartButton}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-sm)", color: "white", padding: "0.4rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div
          className="glass admin-slide-down"
          style={{
            position: "fixed",
            top: 65,
            left: 0,
            right: 0,
            zIndex: 48,
            padding: "0.5rem 1.25rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.1rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link
            href="/catalogo"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: "0.85rem 0.5rem",
              fontWeight: 500,
              fontSize: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "block",
            }}
          >
            Catálogo
          </Link>
          <Link
            href="/#featured"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: "0.85rem 0.5rem",
              fontWeight: 500,
              fontSize: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "block",
            }}
          >
            Destacados
          </Link>

          {!loading && user ? (
            <>
              <div style={{ padding: "0.65rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600 }}>{displayName}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{user.email}</p>
              </div>
              <MenuLink href="/account" icon={User} label="Mi perfil" onClick={() => setMobileOpen(false)} />
              <MenuLink href="/account/orders" icon={Package} label="Mis pedidos" onClick={() => setMobileOpen(false)} />
              <button
                onClick={() => { setMobileOpen(false); signOut(); }}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.75rem 0.8rem", background: "transparent",
                  color: "var(--text-secondary)", border: "none", cursor: "pointer",
                  fontSize: "0.9rem", textAlign: "left", width: "100%",
                }}
              >
                <LogOut size={15} /> Cerrar sesión
              </button>
            </>
          ) : !loading ? (
            <button
              onClick={() => { setMobileOpen(false); signInWithGoogle(); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.85rem 0.5rem", background: "transparent",
                color: "white", border: "none", cursor: "pointer",
                fontSize: "0.95rem", fontWeight: 500, textAlign: "left",
              }}
            >
              <LogIn size={16} /> Ingresar con Google
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}

function MenuLink({
  href, icon: Icon, label, onClick,
}: {
  href: string;
  icon: React.FC<{ size?: number; color?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "0.6rem",
        padding: "0.6rem 0.8rem", borderRadius: "var(--radius-sm)",
        color: "white", fontSize: "0.85rem", transition: "background 0.15s",
      }}
    >
      <Icon size={15} color="var(--accent-pink)" />
      {label}
    </Link>
  );
}