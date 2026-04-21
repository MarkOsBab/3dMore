"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../lib/CartContext";

export default function Navbar() {
  const { items, setIsCartOpen } = useCart();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, padding: "1rem 0" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "2px" }} className="text-gradient">
          3DMORE
        </Link>
        
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link href="/#products" style={{ fontWeight: 500, transition: "color 0.2s" }}>
            Catálogo
          </Link>
          <button 
            style={{ background: "transparent", color: "white", position: "relative" }}
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span style={{ position: "absolute", top: "-10px", right: "-10px", background: "var(--accent-pink)", color: "white", fontSize: "0.75rem", fontWeight: "bold", width: "20px", height: "20px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
