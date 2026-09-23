import { db } from './index'
import { categories, products, sellers, productOffers } from './schema'
import { eq, and, desc, asc, sql, or, ilike, isNull, inArray } from 'drizzle-orm'

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

/* ============================================================
   PRODUCTOS
   ============================================================ */

export async function getPublishedProducts(limit = 100) {
  return db
    .select()
    .from(products)
    .where(eq(products.status, 'published'))
    .orderBy(desc(products.createdAt))
    .limit(limit)
}

export async function getProductsByCategory(categorySlug: string) {
  const category = await getCategoryBySlug(categorySlug)
  if (!category) return []

  const subs = await getSubcategories(category.id)
  const ids = [category.id, ...subs.map((s) => s.id)]

  return db
    .select()
    .from(products)
    .where(
      and(eq(products.status, 'published'), inArray(products.categoryId, ids)),
    )
    .orderBy(desc(products.createdAt))
}

export async function getProductWithSeller(productId: string) {
  const prodRows = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!prodRows[0]) return null

  const product = prodRows[0]

  const sellerRows = product.sellerId
    ? await db
        .select()
        .from(sellers)
        .where(eq(sellers.id, product.sellerId))
        .limit(1)
    : []

  return {
    product,
    seller: sellerRows[0] || null,
  }
}

export async function searchProducts(query: string, limit = 30) {
  if (!query.trim()) return []

  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, 'published'),
        or(
          ilike(products.title, `%${query}%`),
          ilike(products.description, `%${query}%`),
        ),
      ),
    )
    .limit(limit)
}

export async function getSimilarProducts(productId: string, limit = 6) {
  const prod = await db
    .select({ categoryId: products.categoryId })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!prod[0]?.categoryId) return []

  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, 'published'),
        eq(products.categoryId, prod[0].categoryId),
        sql`${products.id} != ${productId}`,
      ),
    )
    .limit(limit)
}

export async function isAdultCategory(slug: string) {
  const category = await getCategoryBySlug(slug)
  return category?.isAdult === true
}

/* ============================================================
   SECCIONES DE LA HOME
   ============================================================ */

/** Productos con mayor descuento (para "Ofertas del día") */
export async function getOfertasDelDia(limit = 8) {
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, 'published'),
        sql`${products.oldPrice} IS NOT NULL`,
        sql`${products.oldPrice} > ${products.price}`,
      ),
    )
    .orderBy(
      desc(
        sql`(${products.oldPrice} - ${products.price}) / ${products.oldPrice}`,
      ),
    )
    .limit(limit)
}

/** Productos nuevos (últimos 30 días) */
export async function getNovedades(limit = 8) {
  return db
    .select()
    .from(products)
    .where(eq(products.status, 'published'))
    .orderBy(desc(products.createdAt))
    .limit(limit)
}

/** Productos más vendidos (más reseñas) */
export async function getMasVendidos(limit = 8) {
  return db
    .select()
    .from(products)
    .where(eq(products.status, 'published'))
    .orderBy(desc(products.reviewsCount))
    .limit(limit)
}

/* ============================================================
   PRODUCTO COMPLETO CON OFERTAS Y VENDEDORES
   ============================================================ */

export async function getProductFull(productId: string) {
  /* Producto */
  const prodRows = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!prodRows[0]) return null
  const product = prodRows[0]

  /* Vendedor original */
  const sellerRows = product.sellerId
    ? await db
        .select()
        .from(sellers)
        .where(eq(sellers.id, product.sellerId))
        .limit(1)
    : []

  /* Categoría */
  const catRows = product.categoryId
    ? await db
        .select()
        .from(categories)
        .where(eq(categories.id, product.categoryId))
        .limit(1)
    : []

  /* Todas las ofertas de este producto con sus vendedores */
  const ofertas = await db
    .select({
      offer: productOffers,
      seller: sellers,
    })
    .from(productOffers)
    .leftJoin(sellers, eq(productOffers.sellerId, sellers.id))
    .where(
      and(
        eq(productOffers.productId, productId),
        eq(productOffers.active, true),
      ),
    )

  return {
    product,
    seller: sellerRows[0] || null,
    category: catRows[0] || null,
    ofertas,
  }
}