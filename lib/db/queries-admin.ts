import { db } from './index'
import { products, sellers, categories, users } from './schema'
import { eq, desc, sql, and, or, ilike } from 'drizzle-orm'

/* ============================================================
   ESTADÍSTICAS
   ============================================================ */

export async function getAdminStats() {
  try {
    const [sellersApproved] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sellers)
      .where(eq(sellers.status, 'approved'))

    const [sellersPending] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sellers)
      .where(eq(sellers.status, 'pending'))

    const [sellersSuspended] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sellers)
      .where(eq(sellers.status, 'suspended'))

    const [productsTotal] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)

    const [productsPublished] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.status, 'published'))

    const [productsPending] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.status, 'pending'))

    const [categoriesTotal] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(categories)

    const [usersTotal] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)

    return {
      sellersApproved: sellersApproved?.count || 0,
      sellersPending: sellersPending?.count || 0,
      sellersSuspended: sellersSuspended?.count || 0,
      productsTotal: productsTotal?.count || 0,
      productsPublished: productsPublished?.count || 0,
      productsPending: productsPending?.count || 0,
      categoriesTotal: categoriesTotal?.count || 0,
      usersTotal: usersTotal?.count || 0,
    }
  } catch (error) {
    console.error('Error stats:', error)
    return {
      sellersApproved: 0,
      sellersPending: 0,
      sellersSuspended: 0,
      productsTotal: 0,
      productsPublished: 0,
      productsPending: 0,
      categoriesTotal: 0,
      usersTotal: 0,
    }
  }
}

/* ============================================================
   ÚLTIMOS REGISTROS
   ============================================================ */

export async function getLatestProducts(limit = 5) {
  return db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      status: products.status,
      imageUrl: products.imageUrl,
      createdAt: products.createdAt,
    })
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(limit)
}

export async function getLatestSellers(limit = 5) {
  return db
    .select({
      id: sellers.id,
      storeName: sellers.storeName,
      slug: sellers.slug,
      status: sellers.status,
      createdAt: sellers.createdAt,
    })
    .from(sellers)
    .orderBy(desc(sellers.createdAt))
    .limit(limit)
}

/* ============================================================
   VENDEDORES
   ============================================================ */

export async function getAllSellers() {
  return db.select().from(sellers).orderBy(desc(sellers.createdAt))
}

export async function getSellersByStatus(
  status: 'pending' | 'approved' | 'suspended',
) {
  return db
    .select()
    .from(sellers)
    .where(eq(sellers.status, status))
    .orderBy(desc(sellers.createdAt))
}

/* ============================================================
   PRODUCTOS
   ============================================================ */

export async function getAllProducts(limit = 100) {
  return db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(limit)
}

export async function searchAllProducts(query: string) {
  if (!query.trim()) return getAllProducts()
  return db
    .select()
    .from(products)
    .where(
      or(
        ilike(products.title, `%${query}%`),
        ilike(products.description, `%${query}%`),
      ),
    )
    .orderBy(desc(products.createdAt))
    .limit(100)
}

/* ============================================================
   CATEGORÍAS
   ============================================================ */

export async function getAllCategories() {
  return db.select().from(categories).orderBy(categories.order)
}

/* ============================================================
   USUARIOS
   ============================================================ */

export async function getAllUsers(limit = 100) {
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit)
}