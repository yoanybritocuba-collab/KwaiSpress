import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adminSettings } from '@/lib/db/schema'
import { getCurrentUser, isAdminUser } from './roles'

/**
 * Sesión del panel de administración.
 *
 * Tras iniciar sesión, el admin debe desbloquear el panel con la contraseña
 * (ADMIN_PANEL_PASSWORD) y, si tiene configurado un código en admin_settings,
 * también con ese código. El resultado se guarda en una cookie HttpOnly
 * firmada con HMAC y ligada al id del usuario: no se puede falsificar ni
 * leer desde JavaScript (a diferencia del sessionStorage anterior).
 */

export const ADMIN_COOKIE = 'ks_admin'
const MAX_AGE_SECONDS = 60 * 60 * 8 // 8 horas

type TokenPayload = {
  u: string // id del usuario
  c: boolean // ¿código secreto verificado?
  e: number // expiración (epoch segundos)
}

function getSecret(): string | null {
  const base =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PANEL_PASSWORD
  if (!base) return null
  return `kwaispress-admin-v1:${base}`
}

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url')
}

function sign(data: string, secret: string) {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

export function createAdminToken(userId: string, codeVerified: boolean): string | null {
  const secret = getSecret()
  if (!secret) return null
  const payload: TokenPayload = {
    u: userId,
    c: codeVerified,
    e: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  }
  const body = b64url(JSON.stringify(payload))
  return `${body}.${sign(body, secret)}`
}

export function readAdminToken(token: string | undefined, userId: string): TokenPayload | null {
  const secret = getSecret()
  if (!secret || !token) return null

  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  const expected = sign(body, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload
    if (payload.u !== userId) return null
    if (typeof payload.e !== 'number' || payload.e < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

/** Comparación de contraseñas en tiempo constante. */
export function passwordMatches(input: string, expected: string): boolean {
  const a = createHash('sha256').update(input).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function setAdminCookie(userId: string, codeVerified: boolean) {
  const token = createAdminToken(userId, codeVerified)
  if (!token) return false
  const store = await cookies()
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
  return true
}

export async function clearAdminCookie() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}

/** ¿Este admin tiene un código secreto configurado? */
export async function adminRequiresCode(userId: string): Promise<boolean> {
  try {
    const rows = await db
      .select({ hash: adminSettings.panelCodeHash })
      .from(adminSettings)
      .where(eq(adminSettings.userId, userId))
      .limit(1)
    return Boolean(rows[0]?.hash)
  } catch {
    // Si la tabla no existe todavía, solo se exige la contraseña
    return false
  }
}

export type AdminAccess = {
  user: User | null
  isAdmin: boolean
  /** Contraseña (y código, si hace falta) ya verificados */
  unlocked: boolean
  /** Contraseña verificada pero falta el código secreto */
  needsCode: boolean
}

export async function getAdminAccess(): Promise<AdminAccess> {
  const user = await getCurrentUser()
  if (!user || !isAdminUser(user)) {
    return { user, isAdmin: false, unlocked: false, needsCode: false }
  }

  const store = await cookies()
  const token = readAdminToken(store.get(ADMIN_COOKIE)?.value, user.id)
  if (!token) return { user, isAdmin: true, unlocked: false, needsCode: false }

  const requiresCode = await adminRequiresCode(user.id)
  if (requiresCode && !token.c) {
    return { user, isAdmin: true, unlocked: false, needsCode: true }
  }
  return { user, isAdmin: true, unlocked: true, needsCode: false }
}

/** Para layouts/páginas del panel: redirige si no hay acceso completo. */
export async function requireAdminPage(nextPath = '/admin'): Promise<User> {
  const access = await getAdminAccess()
  if (!access.user) redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  if (!access.isAdmin) redirect('/')
  if (!access.unlocked) redirect(`/admin/unlock?next=${encodeURIComponent(nextPath)}`)
  return access.user
}

/** Para rutas API y server actions: devuelve el admin o una respuesta de error. */
export async function requireAdminApi(): Promise<
  { user: User; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  const access = await getAdminAccess()
  if (!access.user) {
    return { error: NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 }) }
  }
  if (!access.isAdmin) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 403 }) }
  }
  if (!access.unlocked) {
    return {
      error: NextResponse.json(
        { error: 'Panel bloqueado. Desbloquéalo primero.', locked: true },
        { status: 403 },
      ),
    }
  }
  return { user: access.user }
}
