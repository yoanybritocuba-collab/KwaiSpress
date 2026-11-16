import { isUuid } from '@/lib/utils'

export const CONDICIONES = ['nuevo', 'como-nuevo', 'usado'] as const
export const MAX_FOTOS = 10

export type ProductInput = {
  titulo: string
  descripcion?: string | null
  precio: number | string
  precioAnterior?: number | string | null
  stock?: number | string | null
  marca?: string | null
  material?: string | null
  estado?: string | null
  badge?: string | null
  categoriaId?: string | null
  fotos?: string[]
}

export type ParsedProduct = {
  title: string
  description: string | null
  price: string
  oldPrice: string | null
  stock: number | null
  brand: string | null
  material: string | null
  condition: string
  badge: string | null
  categoryId: string | null
  images: string[]
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

const MAX_PRICE = 99_999_999.99

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (!t) return null
  return t.slice(0, max)
}

/** Solo se aceptan fotos subidas a NUESTRO bucket público de Supabase. */
function isAllowedImageUrl(url: unknown): url is string {
  if (typeof url !== 'string' || url.length > 600) return false
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return url.startsWith('https://')
  return url.startsWith(`${base.replace(/\/$/, '')}/storage/v1/object/public/products/`)
}

export function parseProductInput(raw: ProductInput): Result<ParsedProduct> {
  const title = cleanText(raw.titulo, 150)
  if (!title || title.length < 3) {
    return { ok: false, error: 'El título debe tener al menos 3 caracteres' }
  }

  const price = toNumber(raw.precio)
  if (price === null || price <= 0 || price > MAX_PRICE) {
    return { ok: false, error: 'El precio no es válido' }
  }

  let oldPrice = toNumber(raw.precioAnterior)
  if (oldPrice !== null) {
    if (oldPrice <= 0 || oldPrice > MAX_PRICE) {
      return { ok: false, error: 'El precio anterior no es válido' }
    }
    // Un "precio anterior" menor o igual no es una oferta: se descarta
    if (oldPrice <= price) oldPrice = null
  }

  const stockNum = toNumber(raw.stock)
  if (stockNum !== null && (!Number.isInteger(stockNum) || stockNum < 0 || stockNum > 1_000_000)) {
    return { ok: false, error: 'El stock debe ser un número entero positivo' }
  }

  const condition = (CONDICIONES as readonly string[]).includes(raw.estado ?? '')
    ? (raw.estado as string)
    : 'nuevo'

  const categoryId = raw.categoriaId ? raw.categoriaId : null
  if (categoryId && !isUuid(categoryId)) {
    return { ok: false, error: 'Categoría no válida' }
  }

  const fotos = Array.isArray(raw.fotos) ? raw.fotos : []
  if (fotos.length > MAX_FOTOS) {
    return { ok: false, error: `Máximo ${MAX_FOTOS} fotos` }
  }
  if (!fotos.every(isAllowedImageUrl)) {
    return { ok: false, error: 'Alguna foto no es válida. Vuelve a subirla.' }
  }

  return {
    ok: true,
    data: {
      title,
      description: cleanText(raw.descripcion, 5000),
      price: price.toFixed(2),
      oldPrice: oldPrice !== null ? oldPrice.toFixed(2) : null,
      stock: stockNum,
      brand: cleanText(raw.marca, 80),
      material: cleanText(raw.material, 80),
      condition,
      badge: cleanText(raw.badge, 24),
      categoryId,
      images: fotos,
    },
  }
}

export type SellerInput = {
  storeName: string
  slug: string
  description?: string | null
  whatsapp?: string | null
  location?: string | null
}

export function parseSellerInput(raw: SellerInput): Result<{
  storeName: string
  slug: string
  description: string | null
  whatsapp: string | null
  location: string | null
}> {
  const storeName = cleanText(raw.storeName, 60)
  if (!storeName || storeName.length < 3) {
    return { ok: false, error: 'El nombre de la tienda debe tener al menos 3 caracteres' }
  }

  const slug = (raw.slug ?? '').trim().toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 3 || slug.length > 60) {
    return { ok: false, error: 'La dirección de la tienda solo puede tener letras, números y guiones (mín. 3)' }
  }
  const reserved = ['admin', 'panel', 'api', 'productos', 'nuevo', 'login', 'register']
  if (reserved.includes(slug)) {
    return { ok: false, error: 'Esa dirección no está disponible. Prueba con otra.' }
  }

  let whatsapp: string | null = null
  if (raw.whatsapp) {
    const digits = String(raw.whatsapp).replace(/\D/g, '')
    if (digits.length < 8 || digits.length > 15) {
      return { ok: false, error: 'El WhatsApp debe incluir el prefijo del país (8–15 dígitos)' }
    }
    whatsapp = digits
  }

  return {
    ok: true,
    data: {
      storeName,
      slug,
      description: cleanText(raw.description, 1000),
      whatsapp,
      location: cleanText(raw.location, 80),
    },
  }
}
