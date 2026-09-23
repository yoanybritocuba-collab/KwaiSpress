import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core'

/* ============================================================
   ENUMS
   ============================================================ */

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'seller',
  'customer',
])

export const sellerStatusEnum = pgEnum('seller_status', [
  'pending',
  'approved',
  'suspended',
])

export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'pending',
  'published',
  'rejected',
])

/* ============================================================
   USERS
   ============================================================ */

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').notNull().default('customer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* ============================================================
   SELLERS
   ============================================================ */

export const sellers = pgTable('sellers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  storeName: text('store_name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logoUrl: text('logo_url'),
  whatsapp: text('whatsapp'),
  location: text('location'),
  instagram: text('instagram'),
  website: text('website'),
  status: sellerStatusEnum('status').notNull().default('pending'),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* ============================================================
   CATEGORIES
   ============================================================ */

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  imageUrl: text('image_url'),
  parentId: uuid('parent_id'),
  order: integer('order').default(0),
  active: boolean('active').default(true),
  isAdult: boolean('is_adult').default(false),
  visible: boolean('visible').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* ============================================================
   PRODUCTS
   ============================================================ */

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id')
    .references(() => sellers.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),

  // Información básica
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),

  // Precios (referencia, la oferta real está en product_offers)
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  oldPrice: numeric('old_price', { precision: 10, scale: 2 }),

  // Imágenes
  imageUrl: text('image_url'),
  images: text('images').array(),

  // Badges y etiquetas
  badge: text('badge'),
  customBadge: text('custom_badge'),
  hiddenBadge: boolean('hidden_badge').default(false),
  adminFeatured: boolean('admin_featured').default(false),
  tags: text('tags').array(),

  // Detalles del producto
  brand: text('brand'),
  colors: text('colors').array(),
  sizes: text('sizes').array(),
  gender: text('gender'),
  material: text('material'),
  ageRange: text('age_range'),
  weight: integer('weight'),
  dimensions: text('dimensions'),
  warrantyMonths: integer('warranty_months'),
  condition: text('condition').default('nuevo'),

  // Valoraciones
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0'),
  reviewsCount: integer('reviews_count').notNull().default(0),

  // Inventario
  stock: integer('stock'),
  sku: text('sku'),

  // Estado
  status: productStatusEnum('status').notNull().default('pending'),
  featured: boolean('featured').notNull().default(false),
  isAdult: boolean('is_adult').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* ============================================================
   PRODUCT OFFERS (ofertas por vendedor)
   ============================================================ */

export const productOffers = pgTable('product_offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  sellerId: uuid('seller_id')
    .references(() => sellers.id, { onDelete: 'cascade' })
    .notNull(),

  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  oldPrice: numeric('old_price', { precision: 10, scale: 2 }),
  stock: integer('stock'),
  sku: text('sku'),

  active: boolean('active').default(true),
  approved: boolean('approved').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* ============================================================
   CHATS
   ============================================================ */

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  customerId: uuid('customer_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  sellerId: uuid('seller_id')
    .references(() => sellers.id, { onDelete: 'cascade' })
    .notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* ============================================================
   MESSAGES
   ============================================================ */

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id')
    .references(() => chats.id, { onDelete: 'cascade' })
    .notNull(),
  senderId: uuid('sender_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* ============================================================
   FAVORITES
   ============================================================ */

export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/* ============================================================
   TIPOS
   ============================================================ */

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Seller = typeof sellers.$inferSelect
export type NewSeller = typeof sellers.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductOffer = typeof productOffers.$inferSelect
export type NewProductOffer = typeof productOffers.$inferInsert
export type Chat = typeof chats.$inferSelect
export type NewChat = typeof chats.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert