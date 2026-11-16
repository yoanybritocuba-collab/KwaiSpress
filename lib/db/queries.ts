import { db } from './index'
import { categories, products, sellers, productOffers } from './schema'
import { eq, and, desc, asc, sql, or, ilike, isNull, ne, isNotNull } from 'drizzle-orm'
import { escapeLike } from '@/lib/utils'
import type { ProductCardData } from '@/lib/types'

/* ============================================================
   CATEGORÍAS
   ============================================================ */

export async function getMainCategories() {
  return db
    .select()
    .from(categories)
    .where(and(isNull(categories.parentId), eq(categories.active, true)))
    .orderBy(asc(categories.order))
}

export async function getSubcategories(parentId: string) {
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.parentId, parentId), eq(categories.active, true)))
    .orderBy(asc(categories.order))
}

export async function getCategoryBySlug(slug: string) {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1)
  return result[0] || null
}

export async function getCategoriesWithSubcategories() {
  const all = await db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.order))

  const mains = all.filter((c) => !c.parentId)
  return mains.map((main) => ({
    ...main,
    subcategories: all.filter((sub) => sub.parentId === main.id),
  }))
}

export async function getCategories() {
  return getMainCategories()
}

/** Todas las categorías activas (principales y subcategorías) en lista plana. */
export async function getAllActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.order))
}

/* ============================================================
   TARJETAS DE PRODUCTO (con datos del vendedor)
   Solo productos publicados de vendedores aprobados.
   ============================================================ */

const cardColumns = {
  id: products.id,
  title: products.title,
  price: products.price,
  oldPrice: products.oldPrice,
  imageUrl: products.imageUrl,
  badge: products.badge,
  rating: products.rating,
  reviewsCount: products.reviewsCount,
  categoryId: products.categoryId,
  sellerId: sellers.id,
  sellerName: sellers.storeName,
  sellerWhatsapp: sellers.whatsapp,
}

type CardRow = {
  id: string
  title: string
  price: string
  oldPrice: string | null
  imageUrl: string | null
  badge: string | null
  rating: string | null
  reviewsCount: number
  categoryId: string | null
  sellerId: string
  sellerName: string
  sellerWhatsapp: string | null
}

function toCard(r: CardRow): ProductCardData {
  return {
    id: r.id,
    title: r.title,
    price: Number(r.price),
    oldPrice: r.oldPrice ? Number(r.oldPrice) : null,
    imageUrl: r.imageUrl,
    badge: r.badge,
    rating: r.rating ? Number(r.rating) : 0,
    reviewsCount: r.reviewsCount || 0,
    categoryId: r.categoryId,
    sellerId: r.sellerId,
    sellerName: r.sellerName,
    sellerWhatsapp: r.sellerWhatsapp ?? '',
  }
}

const visible = and(
  eq(products.status, 'published'),
  eq(sellers.status, 'approved'),
)

function cardsQuery() {
  return db
    .select(cardColumns)
    .from(products)
    .innerJoin(sellers, eq(products.sellerId, sellers.id))
}

/* ============================================================
   PRODUCTOS
   ============================================================ */

export async function getPublishedProducts(limit = 100): Promise<ProductCardData[]> {
  const rows = await cardsQuery()
    .where(visible)
    .orderBy(desc(products.createdAt))
    .limit(limit)
  return rows.map(toCard)
}

export async function searchProducts(
  query: string,
  limit = 60,
): Promise<ProductCardData[]> {
  const q = query.trim().slice(0, 80)
  if (!q) return []
  const pattern = `%${escapeLike(q)}%`

  const rows = await cardsQuery()
    .where(
      and(
        visible,
        or(ilike(products.title, pattern), ilike(products.description, pattern)),
      ),
    )
    .orderBy(desc(products.createdAt))
    .limit(limit)
  return rows.map(toCard)
}

export async function getSimilarProducts(
  productId: string,
  limit = 6,
): Promise<ProductCardData[]> {
  const prod = await db
    .select({ categoryId: products.categoryId })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  const categoryId = prod[0]?.categoryId
  if (!categoryId) return []

  const rows = await cardsQuery()
    .where(
      and(visible, eq(products.categoryId, categoryId), ne(products.id, productId)),
    )
    .orderBy(desc(products.createdAt))
    .limit(limit)
  return rows.map(toCard)
}

export async function getSellerProducts(
  sellerId: string,
  excludeId?: string,
  limit = 60,
): Promise<ProductCardData[]> {
  const rows = await cardsQuery()
    .where(
      and(
        visible,
        eq(products.sellerId, sellerId),
        excludeId ? ne(products.id, excludeId) : undefined,
      ),
    )
    .orderBy(desc(products.createdAt))
    .limit(limit)
  return rows.map(toCard)
}

/* ============================================================
   SECCIONES DE LA HOME
   ============================================================ */

/** Productos con mayor descuento (para "Ofertas del día") */
export async function getOfertasDelDia(limit = 8): Promise<ProductCardData[]> {
  const rows = await cardsQuery()
    .where(
      and(
        visible,
        isNotNull(products.oldPrice),
        sql`${products.oldPrice} > ${products.price}`,
      ),
    )
    .orderBy(
      desc(sql`(${products.oldPrice} - ${products.price}) / ${products.oldPrice}`),
    )
    .limit(limit)
  return rows.map(toCard)
}

/** Productos más recientes */
export async function getNovedades(limit = 8): Promise<ProductCardData[]> {
  return getPublishedProducts(limit)
}

/** Productos más vendidos (más reseñas) */
export async function getMasVendidos(limit = 8): Promise<ProductCardData[]> {
  const rows = await cardsQuery()
    .where(visible)
    .orderBy(desc(products.reviewsCount), desc(products.createdAt))
    .limit(limit)
  return rows.map(toCard)
}

/* ============================================================
   PRODUCTO COMPLETO CON OFERTAS Y VENDEDORES
   ============================================================ */

export async function getProductFull(
  productId: string,
  opts: { includeUnpublished?: boolean } = {},
) {
  const prodRows = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  const product = prodRows[0]
  if (!product) return null
  if (!opts.includeUnpublished && product.status !== 'published') return null

  const sellerRows = product.sellerId
    ? await db.select().from(sellers).where(eq(sellers.id, product.sellerId)).limit(1)
    : []
  const seller = sellerRows[0] || null

  // Los productos de tiendas pendientes o suspendidas no se muestran
  if (!opts.includeUnpublished && seller?.status !== 'approved') return null

  const catRows = product.categoryId
    ? await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1)
    : []

  /* Todas las ofertas activas de este producto (solo vendedores aprobados) */
  const ofertas = await db
    .select({ offer: productOffers, seller: sellers })
    .from(productOffers)
    .innerJoin(sellers, eq(productOffers.sellerId, sellers.id))
    .where(
      and(
        eq(productOffers.productId, productId),
        eq(productOffers.active, true),
        eq(productOffers.approved, true),
        eq(sellers.status, 'approved'),
      ),
    )

  return {
    product,
    seller,
    category: catRows[0] || null,
    ofertas,
  }
}

/** Versión pública y segura para la API (sin datos internos del vendedor). */
export async function getPublicProduct(productId: string) {
  const full = await getProductFull(productId)
  if (!full) return null
  const { product, seller } = full
  return {
    product: {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      imageUrl: product.imageUrl,
      images: product.images,
      badge: product.badge,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      categoryId: product.categoryId,
    },
    seller: seller
      ? {
          id: seller.id,
          storeName: seller.storeName,
          slug: seller.slug,
          location: seller.location,
          verified: seller.verified,
        }
      : null,
  }
}
