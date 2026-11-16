import { db } from './index'
import { products, sellers, categories, users } from './schema'
import { eq, desc, sql, or, ilike, asc } from 'drizzle-orm'
import { escapeLike } from '@/lib/utils'

const count = sql<number>`count(*)::int`

/* ============================================================
   ESTADÍSTICAS
   ============================================================ */

export async function getAdminStats() {
  const empty = {
    sellersApproved: 0,
    sellersPending: 0,
    sellersSuspended: 0,
    productsTotal: 0,
    productsPublished: 0,
    productsPending: 0,
    categoriesTotal: 0,
    usersTotal: 0,
    failed: true,
  }

  try {
    const [sellerRows, productRows, [categoriesTotal], [usersTotal]] = await Promise.all([
      db.select({ status: sellers.status, n: count }).from(sellers).groupBy(sellers.status),
      db.select({ status: products.status, n: count }).from(products).groupBy(products.status),
      db.select({ n: count }).from(categories),
      db.select({ n: count }).from(users),
    ])

    const s = (st: string) => sellerRows.find((r) => r.status === st)?.n ?? 0
    const p = (st: string) => productRows.find((r) => r.status === st)?.n ?? 0

    return {
      sellersApproved: s('approved'),
      sellersPending: s('pending'),
      sellersSuspended: s('suspended'),
      productsTotal: productRows.reduce((a, r) => a + r.n, 0),
      productsPublished: p('published'),
      productsPending: p('pending'),
      categoriesTotal: categoriesTotal?.n ?? 0,
      usersTotal: usersTotal?.n ?? 0,
      failed: false,
    }
  } catch (error) {
    console.error('Error cargando estadísticas del panel:', error)
    return empty
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
  return db
    .select({
      id: sellers.id,
      storeName: sellers.storeName,
      slug: sellers.slug,
      location: sellers.location,
      whatsapp: sellers.whatsapp,
      status: sellers.status,
      verified: sellers.verified,
      createdAt: sellers.createdAt,
      email: users.email,
      productsCount: sql<number>`(select count(*)::int from ${products} where ${products.sellerId} = ${sellers.id})`,
    })
    .from(sellers)
    .leftJoin(users, eq(users.id, sellers.userId))
    .orderBy(desc(sellers.createdAt))
}

/* ============================================================
   PRODUCTOS
   ============================================================ */

const adminProductColumns = {
  id: products.id,
  title: products.title,
  price: products.price,
  stock: products.stock,
  status: products.status,
  imageUrl: products.imageUrl,
  createdAt: products.createdAt,
  sellerId: products.sellerId,
  sellerName: sellers.storeName,
}

export async function getAllProducts(limit = 200) {
  return db
    .select(adminProductColumns)
    .from(products)
    .leftJoin(sellers, eq(products.sellerId, sellers.id))
    .orderBy(desc(products.createdAt))
    .limit(limit)
}

export async function getProductsBySeller(sellerId: string, limit = 200) {
  return db
    .select(adminProductColumns)
    .from(products)
    .leftJoin(sellers, eq(products.sellerId, sellers.id))
    .where(eq(products.sellerId, sellerId))
    .orderBy(desc(products.createdAt))
    .limit(limit)
}

export async function searchAllProducts(query: string) {
  const q = query.trim()
  if (!q) return getAllProducts()
  const pattern = `%${escapeLike(q)}%`
  return db
    .select(adminProductColumns)
    .from(products)
    .leftJoin(sellers, eq(products.sellerId, sellers.id))
    .where(or(ilike(products.title, pattern), ilike(products.description, pattern)))
    .orderBy(desc(products.createdAt))
    .limit(200)
}

/* ============================================================
   CATEGORÍAS
   ============================================================ */

export async function getAllCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon: categories.icon,
      parentId: categories.parentId,
      order: categories.order,
      active: categories.active,
      isAdult: categories.isAdult,
      productsCount: sql<number>`(select count(*)::int from ${products} where ${products.categoryId} = ${categories.id})`,
    })
    .from(categories)
    .orderBy(asc(categories.order), asc(categories.name))
}

export async function getAllCategories() {
  return db.select().from(categories).orderBy(asc(categories.order))
}

/* ============================================================
   USUARIOS
   ============================================================ */

export async function getAllUsers(limit = 100) {
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit)
}
