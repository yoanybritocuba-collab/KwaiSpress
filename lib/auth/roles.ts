import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * ¿Es administrador?
 *
 * IMPORTANTE: `user_metadata` lo puede modificar CUALQUIER usuario desde el
 * navegador (supabase.auth.updateUser({ data: { role: 'admin' } })), así que
 * jamás se usa para decidir permisos. Solo se confía en:
 *   1. `app_metadata.role === 'admin'` (solo editable con la service key / SQL)
 *   2. emails de la variable de entorno ADMIN_EMAILS (con email confirmado)
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false

  if (user.app_metadata?.role === 'admin') return true

  const allowed = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  return Boolean(
    user.email &&
      user.email_confirmed_at &&
      allowed.includes(user.email.toLowerCase()),
  )
}

/** Usuario autenticado (validado contra Supabase) o null. Nunca lanza. */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return data.user ?? null
  } catch {
    return null
  }
}
