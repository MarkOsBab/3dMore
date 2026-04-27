-- AlterTable: agregar trackingCode y trackingCarrier al modelo Order
ALTER TABLE "Order" ADD COLUMN "trackingCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "trackingCarrier" TEXT;
