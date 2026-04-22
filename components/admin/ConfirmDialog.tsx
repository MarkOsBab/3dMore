"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { AlertTriangle, X, Info } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ConfirmOptions {
  message: string;
  title?: string;
  confirmLabel?: string;
  /** true = botón rojo (peligro), false = botón azul. Default: true */
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;
type AlertFn = (message: string, title?: string) => Promise<void>;

interface DialogAPI {
  confirm: ConfirmFn;
  alert: AlertFn;
}

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */

const ConfirmContext = createContext<DialogAPI>({
  confirm: () => Promise.resolve(false),
  alert: () => Promise.resolve(),
});

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext).confirm;
}

export function useAlert(): AlertFn {
  return useContext(ConfirmContext).alert;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */

interface DialogState {
  open: boolean;
  mode: "confirm" | "alert";
  options: ConfirmOptions;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({
    open: false,
    mode: "confirm",
    options: { message: "" },
  });

  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const confirm: ConfirmFn = useCallback((optionsOrMessage) => {
    const options =
      typeof optionsOrMessage === "string"
        ? { message: optionsOrMessage }
        : optionsOrMessage;
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, mode: "confirm", options });
    });
  }, []);

  const alert: AlertFn = useCallback((message, title) => {
    return new Promise((resolve) => {
      resolveRef.current = () => resolve();
      setState({ open: true, mode: "alert", options: { message, title, danger: false } });
    });
  }, []);

  const handleConfirm = () => {
    setState((s) => ({ ...s, open: false }));
    resolveRef.current(true);
  };

  const handleCancel = () => {
    setState((s) => ({ ...s, open: false }));
    resolveRef.current(false);
  };

  const isDanger = state.options.danger !== false && state.mode === "confirm";

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}

      {state.open && (
        <div style={overlayStyle} onClick={handleCancel}>
          <div
            className="admin-modal-enter"
            style={dialogStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  ...iconBoxStyle,
                  background: isDanger
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(59,130,246,0.15)",
                  border: isDanger
                    ? "1px solid rgba(239,68,68,0.25)"
                    : "1px solid rgba(59,130,246,0.25)",
                }}
              >
                {state.mode === "alert" ? (
                  <Info size={17} color="#3b82f6" />
                ) : (
                  <AlertTriangle size={17} color="#ef4444" />
                )}
              </div>

              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  margin: 0,
                  flex: 1,
                  color: "var(--text-primary)",
                }}
              >
                {state.options.title ??
                  (state.mode === "alert" ? "Aviso" : "Confirmar acción")}
              </h3>

              <button onClick={handleCancel} style={closeButtonStyle}>
                <X size={15} />
              </button>
            </div>

            {/* Message */}
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                lineHeight: 1.55,
                marginBottom: "1.5rem",
              }}
            >
              {state.options.message}
            </p>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "0.65rem",
                justifyContent: "flex-end",
              }}
            >
              {state.mode === "confirm" && (
                <button onClick={handleCancel} style={cancelBtnStyle}>
                  Cancelar
                </button>
              )}
              <button
                onClick={handleConfirm}
                style={isDanger ? dangerBtnStyle : primaryBtnStyle}
              >
                {state.options.confirmLabel ??
                  (state.mode === "alert" ? "Aceptar" : "Eliminar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(6px)",
  zIndex: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
};

const dialogStyle: React.CSSProperties = {
  backgroundColor: "#13131e",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "var(--radius-xl)",
  padding: "1.75rem",
  width: "100%",
  maxWidth: "420px",
};

const iconBoxStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 9,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const closeButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  padding: "0.35rem",
  color: "var(--text-secondary)",
  cursor: "pointer",
  display: "flex",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "0.6rem 1.25rem",
  borderRadius: "var(--radius-md)",
  fontWeight: 600,
  cursor: "pointer",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "var(--text-secondary)",
  fontSize: "0.9rem",
};

const dangerBtnStyle: React.CSSProperties = {
  padding: "0.6rem 1.25rem",
  borderRadius: "var(--radius-md)",
  fontWeight: 600,
  cursor: "pointer",
  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
  border: "none",
  color: "white",
  fontSize: "0.9rem",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "0.6rem 1.25rem",
  borderRadius: "var(--radius-md)",
  fontWeight: 600,
  cursor: "pointer",
  background: "linear-gradient(135deg, #ff2a85, #3b82f6)",
  border: "none",
  color: "white",
  fontSize: "0.9rem",
};
