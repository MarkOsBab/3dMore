"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true, category: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllProductsAdmin() {
  return prisma.product.findMany({
    include: { variants: true, category: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  categoryId?: string | null;
  thumbnail?: string;
  isOffer?: boolean;
  discountPct?: number;
}) {
  const product = await prisma.product.create({ data });
  revalidatePath("/");
  revalidatePath("/admin/products");
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: string | null;
    thumbnail?: string;
    isOffer?: boolean;
    discountPct?: number;
    isActive?: boolean;
  }
) {
  const product = await prisma.product.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
  return product;
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/products");
}

// ─── VARIANTS ─────────────────────────────────────────────────────────────────

export async function createVariant(data: {
  productId: string;
  colorName: string;
  imageUrl: string;
  price?: number | null;
  isOffer?: boolean;
  discountPct?: number;
}) {
  const variant = await prisma.productVariant.create({ data });
  revalidatePath(`/products/${data.productId}`);
  revalidatePath("/admin/products");
  return variant;
}

export async function deleteVariant(id: string, productId: string) {
  await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/products/${productId}`);
  revalidatePath("/admin/products");
}

export async function updateVariant(
  id: string,
  productId: string,
  data: {
    colorName?: string;
    imageUrl?: string;
    price?: number | null;
    isOffer?: boolean;
    discountPct?: number;
  }
) {
  const variant = await prisma.productVariant.update({ where: { id }, data });
  revalidatePath(`/products/${productId}`);
  revalidatePath("/admin/products");
  return variant;
}

// ─── PROMO CODES ──────────────────────────────────────────────────────────────

export async function getPromoCodes() {
  return prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createPromoCode(data: {
  code: string;
  discountPct: number;
  validUntil?: string;
  usageLimit?: number;
}) {
  const promo = await prisma.promoCode.create({
    data: {
      code: data.code.toUpperCase(),
      discountPct: data.discountPct,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      usageLimit: data.usageLimit ?? 100,
    },
  });
  revalidatePath("/admin/promos");
  return promo;
}

export async function togglePromoCode(id: string, isActive: boolean) {
  const promo = await prisma.promoCode.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/promos");
  return promo;
}

export async function deletePromoCode(id: string) {
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promos");
}

export async function validatePromoCode(
  code: string,
  currentUserId?: string | null,
): Promise<{ valid: boolean; discountPct?: number; message?: string }> {
  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });

  if (!promo || !promo.isActive) return { valid: false, message: "Código inválido" };
  if (promo.validUntil && new Date() > promo.validUntil) return { valid: false, message: "Código expirado" };
  if (promo.usageLimit && promo.timesUsed >= promo.usageLimit) return { valid: false, message: "Código agotado" };
  if (promo.userId && promo.userId !== currentUserId) {
    return { valid: false, message: "Este código es personal, no corresponde a tu cuenta." };
  }

  return { valid: true, discountPct: promo.discountPct };
}
