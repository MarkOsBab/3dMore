"use client";

import { useCart, getUnitPrice } from "@/lib/CartContext";
import { X, Trash2, Tag, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CartModal() {
  const router = useRouter();
  const {
    items, isCartOpen, setIsCartOpen, removeFromCart,
    subtotal, total, promoCode, promoDiscount, applyPromo, removePromo,
  } = useCart();

  const [codeInput, setCodeInput] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "ok" | "err">("idle");
  const [promoLoading, setPromoLoading] = useState(false);
  const [exitingId, setExitingId] = useState<string | null>(null);

  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      setShouldRender(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsVisible(true))
      );
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(t);
    }
  }, [isCartOpen]);

  const handleRemove = (id: string) => {
    setExitingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setExitingId(null);
    }, 340);
  };

  const handleApplyPromo = async () => {
    if (!codeInput.trim()) return;
    setPromoLoading(true);
    const result = await applyPromo(codeInput.trim());
    setPromoMsg(result.message);
    setPromoStatus(result.valid ? "ok" : "err");
    setPromoLoading(false);
    if (result.valid) setCodeInput("");
  };

  const handleContinue = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="glass cart-modal-panel"
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "var(--bg-dark)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-drawer)",
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>TU CARRITO</h2>
          <button aria-label="Cerrar carrito" style={{ background: "none", color: "white" }} onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem", paddingRight: "0.25rem" }}>
          {items.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "3rem" }}>Tu carrito está vacío.</p>
          ) : (
            items.map((item) => {
              const unitPriceValue = getUnitPrice(item);
              const isExiting = exitingId === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    transition: "transform 0.34s cubic-bezier(0.4,0,0.2,1), opacity 0.34s ease, max-height 0.34s ease",
                    transform: isExiting ? "translateX(60px)" : "translateX(0)",
                    opacity: isExiting ? 0 : 1,
                    maxHeight: isExiting ? "0" : "120px",
                    overflow: "hidden",
                    pointerEvents: isExiting ? "none" : "auto",
                    ...(isExiting ? {} : {}),
                  }}
                >
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} style={{ width: 68, height: 68, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</h4>
                    {item.variantColorName && (
                      <p style={{ fontSize: "0.8rem", color: "var(--accent-pink)", marginBottom: "0.15rem" }}>
                        Color: {item.variantColorName}
                      </p>
                    )}
                    {item.customColors && Object.keys(item.customColors).length > 0 && (
                      <p style={{ fontSize: "0.75rem", color: "var(--accent-pink)", marginBottom: "0.15rem", lineHeight: 1.4 }}>
                        {Object.entries(item.customColors).map(([part, col]) => `${part}: ${col}`).join(" · ")}
                      </p>
                    )}
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      Cant: {item.quantity}
                      {item.isOffer && item.discountPercentage ? (
                        <span style={{ marginLeft: "0.5rem", color: "var(--success)" }}>{item.discountPercentage}% OFF</span>
                      ) : null}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, color: "var(--accent-blue)" }}>
                      ${(unitPriceValue * item.quantity).toFixed(0)}
                    </span>
                    <button aria-label="Eliminar producto" style={{ color: "var(--accent-pink)", background: "none" }} onClick={() => handleRemove(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div style={{ paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>

            <div style={{ marginBottom: "1.5rem" }}>
              {!promoCode ? (
                <div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      value={codeInput}
                      onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setPromoStatus("idle"); }}
                      placeholder="Código de descuento"
                      style={{ flexGrow: 1, backgroundColor: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-sm)", padding: "0.6rem 0.9rem", color: "white", fontSize: "0.9rem", outline: "none", fontFamily: "var(--font-mono)" }}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", borderRadius: "var(--radius-sm)", background: "var(--surface-3)", border: "1px solid rgba(255,255,255,0.15)", color: "white", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
                    >
                      <Tag size={16} /> {promoLoading ? "..." : "Aplicar"}
                    </button>
                  </div>
                  {promoMsg && (
                    <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", color: promoStatus === "ok" ? "var(--success)" : "var(--danger)" }}>
                      {promoStatus === "ok" ? <CheckCircle size={14} /> : <XCircle size={14} />} {promoMsg}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.9rem", borderRadius: "var(--radius-sm)", background: "var(--success-soft)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <p style={{ color: "var(--success)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle size={16} /> <code style={{ fontFamily: "var(--font-mono)" }}>{promoCode}</code> — {promoDiscount}% OFF
                  </p>
                  <button aria-label="Quitar código" onClick={removePromo} style={{ background: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {promoDiscount > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(0)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)", fontSize: "0.9rem" }}>
                    <span>Descuento ({promoDiscount}%)</span>
                    <span>-${(subtotal - total).toFixed(0)}</span>
                  </div>
                </>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>
                <span>Total</span>
                <span className="text-gradient">${total.toFixed(0)} UYU</span>
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
                El costo de envío se calcula en el siguiente paso.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="btn-primary"
              style={{
                width: "100%", background: "var(--accent-pink)",
                boxShadow: "var(--shadow-cta-pink, 0 10px 30px -10px rgba(255,42,133,0.6))",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "0.6rem", fontWeight: 700,
              }}
            >
              Continuar al checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

