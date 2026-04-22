"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ShoppingBag, HelpCircle, Truck, Sparkles } from "lucide-react";

type Option = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  description: string;
  message: string;
};

const OPTIONS: Option[] = [
  {
    icon: ShoppingBag,
    label: "Hacer un pedido",
    description: "Consultas sobre productos o compras",
    message: "¡Hola 3DMORE! Me gustaría hacer un pedido 🛒",
  },
  {
    icon: HelpCircle,
    label: "Consulta general",
    description: "Dudas sobre materiales, medidas o colores",
    message: "¡Hola 3DMORE! Tengo una consulta 🤔",
  },
  {
    icon: Truck,
    label: "Envíos y entregas",
    description: "Información sobre envíos a todo Uruguay",
    message: "¡Hola 3DMORE! Quiero consultar sobre envíos 📦",
  },
  {
    icon: Sparkles,
    label: "Diseño personalizado",
    description: "Pedir un accesorio hecho a medida",
    message: "¡Hola 3DMORE! Me interesa un diseño personalizado ✨",
  },
];

export default function WhatsAppFab() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const send = (msg: string) => {
    if (!phone) return;
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div ref={panelRef} className="wa-fab-wrap" aria-live="polite">
      {open && (
        <div className="wa-fab-panel" role="dialog" aria-label="Contactar por WhatsApp">
          <div className="wa-fab-header">
            <div className="wa-fab-avatar" aria-hidden="true">
              <MessageCircle size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="wa-fab-title">3DMORE</div>
              <div className="wa-fab-subtitle">Respondemos lo antes posible</div>
            </div>
            <button
              type="button"
              className="wa-fab-close"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="wa-fab-body">
            <p className="wa-fab-intro">¿En qué podemos ayudarte?</p>
            <ul className="wa-fab-options">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <li key={opt.label}>
                    <button
                      type="button"
                      className="wa-fab-option"
                      onClick={() => send(opt.message)}
                    >
                      <span className="wa-fab-option-icon" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      <span className="wa-fab-option-text">
                        <span className="wa-fab-option-label">{opt.label}</span>
                        <span className="wa-fab-option-desc">{opt.description}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`wa-fab-button ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-label={open ? "Cerrar menú de contacto" : "Abrir menú de contacto por WhatsApp"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={26} /> : <WhatsAppIcon />}
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
