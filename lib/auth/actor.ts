import type { User } from '@supabase/supabase-js'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { sellers, users, type Seller } from '@/lib/db/schema'
import { slugify } from '@/lib/utils'
import { getAdminAccess } from './admin-session'

export type Actor = {
  user: User
  /** Administrador con el panel desbloqueado (contraseña/código verificados) */
  admin: boolean
  seller: Seller | null
}

/** Quién hace la petición y qué puede hacer. null = no ha iniciado sesión. */
export async function getActor(): Promise<Actor | null> {
  const access = await getAdminAccess()
  if (!access.user) return null

  const rows = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, access.user.id))
    .limit(1)

  return {
    user: access.user,
    admin: access.isAdmin && access.unlocked,
    seller: rows[0] ?? null,
  }
}

/**
 * Tienda oficial del administrador. Se crea solo para admins verificados
 * (antes cualquier usuario podía crearse una tienda aprobada desde el navegador).
 */
export async function ensureAdminSeller(user: User): Promise<Seller> {
  const existing = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, user.id))
    .limit(1)

  if (existing[0]) {
    if (existing[0].status !== 'approved') {
      const [updated] = await db
        .update(sellers)
        .set({ status: 'approved' })
        .where(eq(sellers.id, existing[0].id))
        .returning()
      return updated
    }
    return existing[0]
  }

  // La tabla sellers referencia a users: aseguramos la fila de perfil
  const name =
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Admin'
  try {
    await db
      .insert(users)
      .values({ id: user.id, email: user.email ?? `${user.id}@sin-email.local`, name, role: 'admin' })
      .onConflictDoNothing()
  } catch (err) {
    console.error('No se pudo asegurar la fila en users:', err)
  }

  const base = slugify('kwaispress oficial') || 'tienda-oficial'
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`
    try {
      const [created] = await db
        .insert(sellers)
        .values({
          userId: user.id,
          storeName: 'KwaiSpress Oficial',
          slug,
          status: 'approved',
          verified: true,
        })
        .returning()
      return created
    } catch (err) {
      if (!isUniqueViolation(err)) throw err
    }
  }
  throw new Error('No se pudo crear la tienda oficial')
}

export function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } } | null
  return e?.code === '23505' || e?.cause?.code === '23505'
}
