"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}

export default function Pagination({ page, totalPages, total, pageSize, onPage }: Props) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Build page numbers: always show first, last, current ± 1, and ellipsis
  const pages: (number | "…")[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(1);
  if (page > 3) pages.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
  if (page < totalPages - 2) pages.push("…");
  if (totalPages > 1) add(totalPages);

  const btnBase: React.CSSProperties = {
    minWidth: 32, height: 32, padding: "0 6px",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 500,
    transition: "all 0.15s",
  };

  const activeBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: "rgba(255,42,133,0.12)",
    borderColor: "rgba(255,42,133,0.4)",
    color: "var(--accent-pink)",
    fontWeight: 700,
  };

  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    ...btnBase,
    opacity: disabled ? 0.35 : 1,
    cursor: disabled ? "default" : "pointer",
  });

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "1.25rem",
      gap: "0.75rem",
      flexWrap: "wrap",
    }}>
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
        Mostrando {from}–{to} de {total}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
        <button
          style={navBtnStyle(page === 1)}
          onClick={() => page > 1 && onPage(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, i) =>
          p === "…"
            ? <span key={`ellipsis-${i}`} style={{ ...btnBase, cursor: "default", border: "none" }}>…</span>
            : <button
                key={p}
                style={p === page ? activeBtnStyle : btnBase}
                onClick={() => onPage(p as number)}
              >
                {p}
              </button>
        )}

        <button
          style={navBtnStyle(page === totalPages)}
          onClick={() => page < totalPages && onPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
