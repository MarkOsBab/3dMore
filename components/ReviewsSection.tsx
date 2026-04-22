import { prisma } from "@/lib/prisma";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

interface ReviewData {
  id: string;
  reviewRating: number | null;
  reviewText: string | null;
  reviewImageUrl: string | null;
  reviewShowImage: boolean;
  updatedAt: Date;
  customerFirstName: string | null;
  customerLastName: string | null;
  items: unknown;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          fill={n <= rating ? "#f59e0b" : "transparent"}
          color={n <= rating ? "#f59e0b" : "rgba(255,255,255,0.15)"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  const name = review.customerFirstName
    ? `${review.customerFirstName}${review.customerLastName ? ` ${review.customerLastName[0]}.` : ""}`
    : "Cliente";

  const items = (Array.isArray(review.items) ? review.items : []) as Array<{ name?: string; quantity?: number }>;
  const productName = items[0]?.name ?? null;

  const showImage = review.reviewShowImage && review.reviewImageUrl;
  const hasText = Boolean(review.reviewText);

  return (
    <div
      className="glass review-card"
      style={{
        borderRadius: "var(--radius-xl)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "1.4rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow accent top-left */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: 80, height: 80,
        background: "radial-gradient(circle, rgba(255,42,133,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header: rating + nombre */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div>
          <StarRating rating={review.reviewRating ?? 5} />
          <p style={{ marginTop: 6, fontWeight: 700, fontSize: "0.9rem" }}>{name}</p>
          {productName && (
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
              {productName}
            </p>
          )}
        </div>
        <Quote size={20} color="rgba(255,42,133,0.25)" style={{ flexShrink: 0, marginTop: 2 }} />
      </div>

      {/* Imagen (si está habilitada) */}
      {showImage && (
        <div style={{
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          aspectRatio: "16/9",
          position: "relative",
          background: "rgba(255,255,255,0.03)",
        }}>
          <Image
            src={review.reviewImageUrl!}
            alt={`Foto de ${name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      )}

      {/* Texto */}
      {hasText && (
        <p style={{
          fontSize: "0.88rem",
          color: "var(--text-secondary)",
          lineHeight: 1.65,
          fontStyle: "italic",
          flex: 1,
        }}>
          &ldquo;{review.reviewText}&rdquo;
        </p>
      )}

      {/* Footer: fecha */}
      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "auto" }}>
        {new Date(review.updatedAt).toLocaleDateString("es-UY", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}

export default async function ReviewsSection() {
  const reviews = await prisma.order.findMany({
    where: {
      reviewRating: { gte: 4 },
      status: "DELIVERED",
    },
    orderBy: { updatedAt: "desc" },
    take: 9,
    select: {
      id: true,
      reviewRating: true,
      reviewText: true,
      reviewImageUrl: true,
      reviewShowImage: true,
      updatedAt: true,
      customerFirstName: true,
      customerLastName: true,
      items: true,
    },
  });

  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + (r.reviewRating ?? 0), 0) / reviews.length;

  return (
    <section style={{ padding: "6rem 0", position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "30%", right: "-15%",
        width: "50vw", height: "50vw",
        background: "var(--glow-pink)",
        filter: "blur(120px)", borderRadius: "50%", zIndex: 0, opacity: 0.4,
        pointerEvents: "none",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Título */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700 }}>
              LO QUE DICEN <span className="text-gradient">NUESTROS CLIENTES</span>
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={16} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span style={{
              fontSize: "1rem", fontWeight: 700,
              fontFamily: "var(--font-mono)", color: "#f59e0b",
            }}>
              {avg.toFixed(1)}
            </span>
            <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              · {reviews.length} reseña{reviews.length !== 1 ? "s" : ""} verificada{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Grid responsive */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
          alignItems: "start",
        }}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
