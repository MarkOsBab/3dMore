"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string | null;
  category: { id: string; name: string; slug: string; sortOrder: number } | null;
  thumbnail: string | null;
  isOffer: boolean;
  discountPct: number | null;
};

interface Props {
  categoryName: string;
  categorySlug: string | null;
  products: Product[];
}

const SCROLL_STEP = 304; // ~280px card + 24px gap
const AUTO_DELAY_MS = 3800;

export default function CategorySlider({ categoryName, categorySlug, products }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncArrows();
    el.addEventListener("scroll", syncArrows, { passive: true });
    const ro = new ResizeObserver(syncArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", syncArrows);
      ro.disconnect();
    };
  }, [syncArrows]);

  // Auto-advance (only when there are enough cards to scroll)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (paused.current || !el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 4) return; // nothing to scroll
      if (el.scrollLeft >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
      }
    }, AUTO_DELAY_MS);
    return () => clearInterval(id);
  }, []);

  const scroll = (dir: "prev" | "next") => {
    trackRef.current?.scrollBy({
      left: dir === "next" ? SCROLL_STEP : -SCROLL_STEP,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {/* Category header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Accent bar */}
          <div
            style={{
              width: 3,
              height: 20,
              borderRadius: 2,
              background: "var(--accent-neon)",
              flexShrink: 0,
            }}
          />
          <h3
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              fontWeight: 700,
              letterSpacing: "-0.3px",
            }}
          >
            {categoryName.toUpperCase()}
          </h3>
          <span
            style={{
              fontSize: "0.7rem",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              padding: "0.15rem 0.55rem",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "var(--radius-pill)",
            }}
          >
            {products.length}
          </span>
        </div>

        {categorySlug && (
          <Link href={`/catalogo?category=${categorySlug}`} className="link-secondary">
            Ver todos <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* Slider wrapper */}
      <div style={{ position: "relative" }}>
        {/* Edge fade overlays */}
        <div
          className="slider-fade-left"
          style={{ opacity: canPrev ? 1 : 0 }}
          aria-hidden="true"
        />
        <div
          className="slider-fade-right"
          style={{ opacity: canNext ? 1 : 0 }}
          aria-hidden="true"
        />

        {/* Prev arrow */}
        {canPrev && (
          <button
            className="slider-arrow slider-arrow-prev"
            onClick={() => scroll("prev")}
            aria-label="Producto anterior"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Next arrow */}
        {canNext && (
          <button
            className="slider-arrow slider-arrow-next"
            onClick={() => scroll("next")}
            aria-label="Producto siguiente"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Scrollable track */}
        <div
          ref={trackRef}
          className="slider-track hide-scrollbar"
          onMouseEnter={() => { paused.current = true; }}
          onMouseLeave={() => { paused.current = false; }}
          onTouchStart={() => { paused.current = true; }}
          onTouchEnd={() => { paused.current = false; }}
        >
          {products.map((p) => (
            <div key={p.id} className="slider-card">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
