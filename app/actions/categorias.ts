'use server'

import { revalidatePath } from 'next/cache'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { getActor, isUniqueViolation } from '@/lib/auth/actor'
import { isUuid, slugify } from '@/lib/utils'

type Res = { ok: true } | { ok: false; error: string }

function refresh() {
  revalidatePath('/')
  revalidatePath('/categorias')
  revalidatePath('/admin/categorias')
}

export async function crearCategoria(input: {
  name: string
  icon?: string
  parentId?: string | null
}): Promise<Res> {
  const actor = await getActor()
  if (!actor?.admin) return { ok: false, error: 'No autorizado' }

  const name = input.name?.trim().slice(0, 60)
  if (!name || name.length < 2) {
    return { ok: false, error: 'El nombre debe tener al menos 2 caracteres' }
  }
  const slug = slugify(name)
  if (!slug) return { ok: false, error: 'Nombre no válido' }

  const parentId = input.parentId || null
  if (parentId && !isUuid(parentId)) return { ok: false, error: 'Categoría padre no válida' }

  try {
    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${categories.order}), 0)::int + 1` })
      .from(categories)

    await db.insert(categories).values({
      name,
      slug,
      icon: input.icon?.trim().slice(0, 8) || null,
      parentId,
      order: next,
      active: true,
    })
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, error: 'Ya existe una categoría con ese nombre' }
    }
    console.error('Error creando categoría:', err)
    return { ok: false, error: 'No se pudo crear la categoría' }
  }

  refresh()
  return { ok: true }
}

export async function cambiarCategoriaActiva(id: string, active: boolean): Promise<Res> {
  const actor = await getActor()
  if (!actor?.admin) return { ok: false, error: 'No autorizado' }
  if (!isUuid(id)) return { ok: false, error: 'Categoría no válida' }

  await db.update(categories).set({ active }).where(eq(categories.id, id))
  refresh()
  return { ok: true }
}

export async function eliminarCategoria(id: string): Promise<Res> {
  const actor = await getActor()
  if (!actor?.admin) return { ok: false, error: 'No autorizado' }
  if (!isUuid(id)) return { ok: false, error: 'Categoría no válida' }

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.categoryId, id))
  if (n > 0) {
    return {
      ok: false,
      error: `Tiene ${n} producto(s). Desactívala en lugar de eliminarla.`,
    }
  }

  const [{ subs }] = await db
    .select({ subs: sql<number>`count(*)::int` })
    .from(categories)
    .where(eq(categories.parentId, id))
  if (subs > 0) {
    return { ok: false, error: 'Tiene subcategorías. Elimínalas primero.' }
  }

  await db.delete(categories).where(eq(categories.id, id))
  refresh()
  return { ok: true }
}
