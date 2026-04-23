"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, SlidersHorizontal, Tag, X, ChevronDown, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

interface CatalogFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentSearch?: string;
  currentSort?: string;
}

const SORT_OPTIONS = [
  { value: "newest",     label: "Más recientes" },
  { value: "oldest",     label: "Más antiguos" },
  { value: "price_asc",  label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

export default function CatalogFilters({
  categories,
  currentCategory,
  currentSearch,
  currentSort,
}: CatalogFiltersProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch ?? "");
  const [mobileOpen, setMobileOpen]   = useState(false);

  // Always-fresh ref so the debounce reads current filter values
  const filtersRef = useRef({ category: currentCategory, sort: currentSort });
  filtersRef.current = { category: currentCategory, sort: currentSort };

  // Debounced search (400 ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchValue) params.set("search", searchValue);
      if (filtersRef.current.category) params.set("category", filtersRef.current.category);
      if (filtersRef.current.sort && filtersRef.current.sort !== "newest")
        params.set("sort", filtersRef.current.sort);
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue, router, pathname]);

  // Sync input when filters are cleared from outside
  useEffect(() => {
    if (!currentSearch) setSearchValue("");
  }, [currentSearch]);

  // Build URL updating one param while preserving the rest
  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const hasFilters =
    !!currentCategory ||
    !!currentSearch ||
    (!!currentSort && currentSort !== "newest");

  const activeCount = [
    currentCategory,
    currentSearch,
    currentSort && currentSort !== "newest" ? currentSort : null,
  ].filter(Boolean).length;

  const sectionStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem",
    border: "var(--hairline)",
    opacity: isPending ? 0.6 : 1,
    transition: "opacity 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.72rem",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    marginBottom: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  };

  return (
    <aside style={{ position: "sticky", top: "5rem", alignSelf: "start" }}>

      {/* ── Mobile toggle bar ─────────────────────────── */}
      <button
        className="catalog-filters-toggle"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {isPending ? (
            <Loader2 size={15} style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
          ) : (
            <SlidersHorizontal size={15} />
          )}
          Filtros
          {activeCount > 0 && (
            <span style={{
              background: "var(--accent-pink)",
              color: "white",
              borderRadius: "999px",
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "1px 6px",
              lineHeight: 1.6,
            }}>
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={15}
          style={{ transition: "transform 0.2s", transform: mobileOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* ── Filter panels ─────────────────────────────── */}
      <div className={`catalog-filters-content${mobileOpen ? " is-open" : ""}`}>

      {/* ── Búsqueda ───────────────────────────────────── */}
      <div style={sectionStyle}>
        <p style={labelStyle}><Search size={13} /> Buscar</p>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Nombre del producto…"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-sm)",
              padding: "0.6rem 2rem 0.6rem 0.75rem",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,42,133,0.4)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          {searchValue && (
            <button
              onClick={() => { setSearchValue(""); setParam("search", null); }}
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                padding: "2px",
                color: "var(--text-muted)",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Ordenar por ────────────────────────────────── */}
      <div style={sectionStyle}>
        <p style={labelStyle}><SlidersHorizontal size={13} /> Ordenar por</p>
        <select
          value={currentSort || "newest"}
          onChange={(e) =>
            setParam("sort", e.target.value === "newest" ? null : e.target.value)
          }
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "var(--radius-sm)",
            padding: "0.6rem 0.75rem",
            color: "var(--text-primary)",
            fontSize: "0.9rem",
            outline: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} style={{ background: "var(--bg-card)" }}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Categorías ─────────────────────────────────── */}
      {categories.length > 0 && (
        <div style={sectionStyle}>
          <p style={labelStyle}><Tag size={13} /> Categorías</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <CategoryBtn
              label="Todos los productos"
              active={!currentCategory}
              onClick={() => setParam("category", null)}
            />
            {categories.map((cat) => (
              <CategoryBtn
                key={cat.id}
                label={cat.name}
                active={currentCategory === cat.slug}
                onClick={() =>
                  setParam("category", currentCategory === cat.slug ? null : cat.slug)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Limpiar filtros ────────────────────────────── */}
      {hasFilters && (
        <button
          onClick={() => { setSearchValue(""); startTransition(() => router.push(pathname)); setMobileOpen(false); }}
          style={{
            padding: "0.6rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.05)",
            color: "var(--danger)",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          <X size={14} /> Limpiar filtros
        </button>
      )}

      {/* ── Loading overlay desktop ────────────────────── */}
      {isPending && (
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "var(--radius-lg)",
          background: "rgba(10,10,15,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(1px)",
          zIndex: 1,
          pointerEvents: "none",
        }} />
      )}

      </div>{/* end catalog-filters-content */}
    </aside>
  );
}

function CategoryBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "0.5rem 0.75rem",
        borderRadius: "var(--radius-sm)",
        background: active ? "rgba(255,42,133,0.12)" : "transparent",
        border: active ? "1px solid rgba(255,42,133,0.3)" : "1px solid transparent",
        color: active ? "var(--accent-pink)" : "var(--text-secondary)",
        fontSize: "0.88rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {label}
    </button>
  );
}
