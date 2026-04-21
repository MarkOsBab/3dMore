"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../lib/CartContext";

export default function Navbar() {
  const { items, setIsCartOpen, lastAdded } = useCart();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const [badgePulse, setBadgePulse] = useState(false);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    setBadgePulse(false);
    // forzar re-render para reiniciar la animación
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setBadgePulse(true));
    });
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setBadgePulse(false), 500);
    return () => { if (pulseTimer.current) clearTimeout(pulseTimer.current); };
  }, [lastAdded]);

  return (
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
          className="text-gradient"
          style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "2px" }}
        >
          3DMORE
        </Link>

        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link href="/#products" style={{ fontWeight: 500, transition: "color 0.2s" }}>
            Catálogo
          </Link>
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
        </div>
      </div>
    </nav>
  );
}
