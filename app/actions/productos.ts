'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { productOffers, products } from '@/lib/db/schema'
import { ensureAdminSeller, getActor, type Actor } from '@/lib/auth/actor'
import {
  parseProductInput,
  type ProductInput,
} from '@/lib/validation/product'
import { isUuid, slugify } from '@/lib/utils'

type Ok<T = object> = { ok: true } & T
type Fail = { ok: false; error: string }

function refresh(sellerSlug?: string) {
  revalidatePath('/')
  revalidatePath('/productos')
  revalidatePath('/categorias')
  revalidatePath('/admin')
  revalidatePath('/admin/productos')
  revalidatePath('/admin/mi-tienda')
  revalidatePath('/admin/mi-tienda/productos')
  if (sellerSlug) {
    revalidatePath(`/vendedor/${sellerSlug}`)
    revalidatePath(`/vendedor/${sellerSlug}/panel`)
  }
}

/** ¿Puede este usuario gestionar este producto? (admin = todos; vendedor = los suyos) */
function canManage(actor: Actor, sellerId: string): boolean {
  if (actor.admin) return true
  return actor.seller?.status === 'approved' && actor.seller.id === sellerId
}

export async function crearProducto(
  input: ProductInput,
): Promise<Ok<{ id: string }> | Fail> {
  const actor = await getActor()
  if (!actor) return { ok: false, error: 'Debes iniciar sesión' }

  let seller = actor.seller
  if (actor.admin) {
    seller = await ensureAdminSeller(actor.user)
  } else if (!seller || seller.status !== 'approved') {
    return { ok: false, error: 'Tu tienda todavía no está aprobada' }
  }

  const parsed = parseProductInput(input)
  if (!parsed.ok) return parsed
  const d = parsed.data

  if (d.images.length === 0) {
    return { ok: false, error: 'Añade al menos 1 foto' }
  }

  try {
    const id = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(products)
        .values({
          sellerId: seller!.id,
          categoryId: d.categoryId,
          title: d.title,
          slug: `${slugify(d.title) || 'producto'}-${Date.now().toString().slice(-6)}`,
          description: d.description,
          price: d.price,
          oldPrice: d.oldPrice,
          imageUrl: d.images[0],
          images: d.images,
          stock: d.stock,
          brand: d.brand,
          material: d.material,
          condition: d.condition,
          badge: d.badge,
          status: 'published',
        })
        .returning({ id: products.id })

      await tx.insert(productOffers).values({
        productId: created.id,
        sellerId: seller!.id,
        price: d.price,
        oldPrice: d.oldPrice,
        stock: d.stock,
        active: true,
        approved: true,
      })

      return created.id
    })

    refresh(seller.slug)
    return { ok: true, id }
  } catch (err) {
    console.error('Error creando producto:', err)
    return { ok: false, error: 'No se pudo publicar el producto' }
  }
}

export async function actualizarProducto(
  id: string,
  input: ProductInput,
): Promise<Ok | Fail> {
  if (!isUuid(id)) return { ok: false, error: 'Producto no válido' }

  const actor = await getActor()
  if (!actor) return { ok: false, error: 'Debes iniciar sesión' }

  const [current] = await db.select().from(products).where(eq(products.id, id)).limit(1)
  if (!current) return { ok: false, error: 'Producto no encontrado' }
  if (!canManage(actor, current.sellerId)) {
    return { ok: false, error: 'No tienes permiso para editar este producto' }
  }

  const parsed = parseProductInput(input)
  if (!parsed.ok) return parsed
  const d = parsed.data

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          categoryId: d.categoryId,
          title: d.title,
          description: d.description,
          price: d.price,
          oldPrice: d.oldPrice,
          ...(d.images.length > 0 ? { imageUrl: d.images[0], images: d.images } : {}),
          stock: d.stock,
          brand: d.brand,
          material: d.material,
          condition: d.condition,
          badge: d.badge,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))

      // Mantiene sincronizada la oferta del propio vendedor
      await tx
        .update(productOffers)
        .set({ price: d.price, oldPrice: d.oldPrice, stock: d.stock, updatedAt: new Date() })
        .where(eq(productOffers.productId, id))
    })

    refresh()
    revalidatePath(`/producto/${id}`)
    return { ok: true }
  } catch (err) {
    console.error('Error actualizando producto:', err)
    return { ok: false, error: 'No se pudieron guardar los cambios' }
  }
}

export async function eliminarProducto(
  id: string,
): Promise<{ success: true } | { error: string }> {
  if (!isUuid(id)) return { error: 'Producto no válido' }

  const actor = await getActor()
  if (!actor) return { error: 'No autorizado' }

  const [current] = await db
    .select({ sellerId: products.sellerId })
    .from(products)
    .where(eq(products.id, id))
    .limit(1)
  if (!current) return { error: 'El producto ya no existe' }
  if (!canManage(actor, current.sellerId)) {
    return { error: 'No tienes permiso para eliminar este producto' }
  }

  try {
    // Las ofertas se eliminan en cascada por la clave foránea
    await db.delete(products).where(eq(products.id, id))
    refresh()
    return { success: true }
  } catch (err) {
    console.error('Error al borrar producto:', err)
    return { error: 'No se pudo eliminar el producto' }
  }
}

/** Moderación: solo administradores. */
export async function cambiarEstadoProducto(
  id: string,
  status: 'draft' | 'pending' | 'published' | 'rejected',
): Promise<Ok | Fail> {
  if (!isUuid(id)) return { ok: false, error: 'Producto no válido' }
  if (!['draft', 'pending', 'published', 'rejected'].includes(status)) {
    return { ok: false, error: 'Estado no válido' }
  }

  const actor = await getActor()
  if (!actor?.admin) return { ok: false, error: 'No autorizado' }

  try {
    await db
      .update(products)
      .set({ status, updatedAt: new Date() })
      .where(eq(products.id, id))
    refresh()
    revalidatePath(`/producto/${id}`)
    return { ok: true }
  } catch (err) {
    console.error('Error cambiando estado:', err)
    return { ok: false, error: 'No se pudo cambiar el estado' }
  }
}
