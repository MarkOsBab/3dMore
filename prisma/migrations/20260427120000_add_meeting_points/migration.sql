-- ─────────────────────────────────────────────────────────────────────────────
-- Migración aditiva: puntos de encuentro y nuevos métodos de envío.
-- Aditiva → segura para datos existentes.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Nuevos campos en ShippingZone
ALTER TABLE "ShippingZone" ADD COLUMN "isMeetingPoint" BOOLEAN;
ALTER TABLE "ShippingZone" ADD COLUMN "meetingPointName" TEXT;

-- 2. Nuevos valores al enum ShippingMethod (no remueve HOME_MVD para compatibilidad)
ALTER TYPE "ShippingMethod" ADD VALUE IF NOT EXISTS 'MEETING_POINT';
ALTER TYPE "ShippingMethod" ADD VALUE IF NOT EXISTS 'HOME_DELIVERY';
