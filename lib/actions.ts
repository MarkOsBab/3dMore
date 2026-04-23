"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export async function getProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { categoryId: null },
        { category: { isActive: true } },
      ],
    },
    include: { variants: true, category: { select: { id: true, name: true, slug: true, sortOrder: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
      OR: [
        { categoryId: null },
        { category: { isActive: true } },
      ],
    },
    include: { variants: true, category: { select: { id: true, name: true, slug: true, sortOrder: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getFilteredProducts(params: {
  category?: string;
  search?: string;
  sort?: string;
}) {
  const { category, search, sort } = params;

  const orderBy =
    sort === "price_asc"  ? ({ price: "asc" }      as const) :
    sort === "price_desc" ? ({ price: "desc" }     as const) :
    sort === "oldest"     ? ({ createdAt: "asc" }  as const) :
                            ({ createdAt: "desc" } as const);

  return prisma.product.findMany({
    where: {
      isActive: true,
      AND: [
        {
          OR: [
            { categoryId: null },
            { category: { isActive: true } },
          ],
        },
        ...(category ? [{ category: { slug: category } }] : []),
        ...(search
          ? [
              {
                OR: [
                  { name: { contains: search, mode: "insensitive" as const } },
                  { description: { contains: search, mode: "insensitive" as const } },
                ],
              },
            ]
          : []),
      ],
    },
    include: {
      variants: true,
      category: { select: { id: true, name: true, slug: true, sortOrder: true } },
    },
    orderBy,
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
    include: {
      variants: true,
      category: { select: { id: true, name: true, slug: true } },
      parts: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: { defaultColor: true },
      },
    },
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
  const product = await prisma.product.create({ data: { ...data, isActive: false } });
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
    isFeatured?: boolean;
    viewerYaw?: number;
    viewerPitch?: number;
    viewerZoom?: number;
    viewerTargetX?: number;
    viewerTargetY?: number;
    viewerTargetZ?: number;
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
  partColors?: Record<string, string> | null;
}) {
  const variant = await prisma.productVariant.create({
    data: {
      productId:   data.productId,
      colorName:   data.colorName,
      imageUrl:    data.imageUrl,
      price:       data.price,
      isOffer:     data.isOffer,
      discountPct: data.discountPct,
      partColors:  data.partColors ?? undefined,
    },
  });
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
    partColors?: Record<string, string> | null;
  }
) {
  const variant = await prisma.productVariant.update({
    where: { id },
    data: {
      ...(data.colorName   !== undefined ? { colorName:   data.colorName }   : {}),
      ...(data.imageUrl    !== undefined ? { imageUrl:    data.imageUrl }    : {}),
      ...(data.price       !== undefined ? { price:       data.price }       : {}),
      ...(data.isOffer     !== undefined ? { isOffer:     data.isOffer }     : {}),
      ...(data.discountPct !== undefined ? { discountPct: data.discountPct } : {}),
      ...(data.partColors  !== undefined ? { partColors:  data.partColors ?? undefined } : {}),
    },
  });
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

// ─── COLORS (paleta global autogestionable) ───────────────────────────────────

export async function getColors() {
  return prisma.color.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getActiveColors() {
  return prisma.color.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createColor(data: { name: string; hex: string; isActive?: boolean; sortOrder?: number }) {
  const color = await prisma.color.create({
    data: {
      name: data.name.trim(),
      hex:  data.hex.trim().toLowerCase(),
      isActive:  data.isActive  ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  revalidatePath("/admin/colors");
  return color;
}

export async function updateColor(id: string, data: { name?: string; hex?: string; isActive?: boolean; sortOrder?: number }) {
  const color = await prisma.color.update({
    where: { id },
    data: {
      ...(data.name      !== undefined ? { name: data.name.trim() } : {}),
      ...(data.hex       !== undefined ? { hex:  data.hex.trim().toLowerCase() } : {}),
      ...(data.isActive  !== undefined ? { isActive:  data.isActive }  : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    },
  });
  revalidatePath("/admin/colors");
  return color;
}

export async function toggleColor(id: string) {
  const curr = await prisma.color.findUniqueOrThrow({ where: { id } });
  const color = await prisma.color.update({ where: { id }, data: { isActive: !curr.isActive } });
  revalidatePath("/admin/colors");
  return color;
}

export async function deleteColor(id: string) {
  await prisma.color.delete({ where: { id } });
  revalidatePath("/admin/colors");
}

export async function reorderColors(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, idx) => prisma.color.update({ where: { id }, data: { sortOrder: idx } })),
  );
  revalidatePath("/admin/colors");
}

// ─── PRODUCT PARTS (modelos 3D por producto) ──────────────────────────────────

export async function getProductParts(productId: string) {
  return prisma.productPart.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { defaultColor: true },
  });
}

type PartInput = {
  name: string;
  modelUrl: string;
  format: string;
  positionX?: number; positionY?: number; positionZ?: number;
  rotationX?: number; rotationY?: number; rotationZ?: number;
  scale?: number;
  defaultColorId?: string | null;
  sortOrder?: number;
};

export async function createProductPart(productId: string, data: PartInput) {
  const part = await prisma.productPart.create({
    data: {
      productId,
      name:     data.name.trim(),
      modelUrl: data.modelUrl,
      format:   data.format,
      positionX: data.positionX ?? 0,
      positionY: data.positionY ?? 0,
      positionZ: data.positionZ ?? 0,
      rotationX: data.rotationX ?? 0,
      rotationY: data.rotationY ?? 0,
      rotationZ: data.rotationZ ?? 0,
      scale:          data.scale          ?? 1,
      defaultColorId: data.defaultColorId ?? null,
      sortOrder:      data.sortOrder      ?? 0,
    },
  });
  revalidatePath(`/admin/products`);
  return part;
}

export async function updateProductPart(id: string, data: Partial<PartInput>) {
  const part = await prisma.productPart.update({
    where: { id },
    data: {
      ...(data.name           !== undefined ? { name: data.name.trim() } : {}),
      ...(data.modelUrl       !== undefined ? { modelUrl: data.modelUrl } : {}),
      ...(data.format         !== undefined ? { format:   data.format }   : {}),
      ...(data.positionX      !== undefined ? { positionX: data.positionX } : {}),
      ...(data.positionY      !== undefined ? { positionY: data.positionY } : {}),
      ...(data.positionZ      !== undefined ? { positionZ: data.positionZ } : {}),
      ...(data.rotationX      !== undefined ? { rotationX: data.rotationX } : {}),
      ...(data.rotationY      !== undefined ? { rotationY: data.rotationY } : {}),
      ...(data.rotationZ      !== undefined ? { rotationZ: data.rotationZ } : {}),
      ...(data.scale          !== undefined ? { scale: data.scale } : {}),
      ...(data.defaultColorId !== undefined ? { defaultColorId: data.defaultColorId } : {}),
      ...(data.sortOrder      !== undefined ? { sortOrder: data.sortOrder } : {}),
    },
  });
  revalidatePath(`/admin/products`);
  return part;
}

export async function deleteProductPart(id: string) {
  await prisma.productPart.delete({ where: { id } });
  revalidatePath(`/admin/products`);
}

export async function reorderProductParts(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, idx) => prisma.productPart.update({ where: { id }, data: { sortOrder: idx } })),
  );
  revalidatePath(`/admin/products`);
}
