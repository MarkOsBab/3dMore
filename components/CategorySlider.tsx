"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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

export default function CategorySlider({ categoryName, categorySlug, products }: Props) {
  const autoplay = useRef(
    Autoplay({ delay: 3800, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: false, align: "start", dragFree: true },
    [autoplay.current]
  );

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    syncButtons();
    emblaApi.on("select", syncButtons);
    emblaApi.on("reInit", syncButtons);
    return () => {
      emblaApi.off("select", syncButtons);
      emblaApi.off("reInit", syncButtons);
    };
  }, [emblaApi, syncButtons]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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

      {/* Slider */}
      <div style={{ position: "relative" }}>
        {/* Edge fades */}
        <div className="slider-fade-left" style={{ opacity: canPrev ? 1 : 0 }} aria-hidden="true" />
        <div className="slider-fade-right" style={{ opacity: canNext ? 1 : 0 }} aria-hidden="true" />

        {/* Prev arrow */}
        {/* <button
          type="button"
          className="slider-arrow slider-arrow-prev"
          style={{ opacity: canPrev ? 1 : 0, pointerEvents: canPrev ? "auto" : "none" }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={scrollPrev}
          tabIndex={-1}
          aria-hidden="true"
          aria-label="Anterior"
        >
          <ChevronLeft size={18} />
        </button> */}

        {/* Next arrow */}
        {/* <button
          type="button"
          className="slider-arrow slider-arrow-next"
          style={{ opacity: canNext ? 1 : 0, pointerEvents: canNext ? "auto" : "none" }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={scrollNext}
          tabIndex={-1}
          aria-hidden="true"
          aria-label="Siguiente"
        >
          <ChevronRight size={18} />
        </button> */}

        {/* Embla viewport */}
        <div ref={emblaRef} className="embla-viewport">
          <div className="embla-container">
            {products.map((p) => (
              <div key={p.id} className="embla-slide">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
