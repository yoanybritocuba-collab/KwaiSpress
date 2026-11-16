import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  ADMIN_COOKIE,
  readAdminToken,
  setAdminCookie,
} from '@/lib/auth/admin-session'
import { getCurrentUser, isAdminUser } from '@/lib/auth/roles'

const MAX_FAILS = 3
const LOCK_MINUTES = 15

/**
 * Paso 2 (opcional) del desbloqueo: código secreto guardado en
 * admin_settings.panel_code_hash (bcrypt vía pgcrypto).
 * Solo se puede llamar después de haber superado el paso de la contraseña.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Exige haber pasado antes el paso de la contraseña
    const store = await cookies()
    if (!readAdminToken(store.get(ADMIN_COOKIE)?.value, user.id)) {
      return NextResponse.json(
        { error: 'Primero introduce la contraseña del panel' },
        { status: 403 },
      )
    }

    const body = (await request.json().catch(() => ({}))) as { code?: unknown }
    if (typeof body.code !== 'string' || !body.code) {
      return NextResponse.json({ error: 'Falta el código' }, { status: 400 })
    }

    const settings = await db.execute(sql`
      SELECT panel_code_hash, failed_attempts, locked_until
      FROM admin_settings
      WHERE user_id = ${user.id}
      LIMIT 1
    `)

    const row = settings[0] as
      | {
          panel_code_hash: string | null
          failed_attempts: number | null
          locked_until: Date | string | null
        }
      | undefined

    // Sin código configurado: con la contraseña basta
    if (!row || !row.panel_code_hash) {
      await setAdminCookie(user.id, true)
      return NextResponse.json({ ok: true })
    }

    if (row.locked_until) {
      const lockedUntil = new Date(row.locked_until)
      if (lockedUntil.getTime() > Date.now()) {
        const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)
        return NextResponse.json(
          { error: `Bloqueado. Inténtalo en ${minutesLeft} minuto(s).`, locked: true },
          { status: 423 },
        )
      }
    }

    const result = await db.execute(sql`
      SELECT (crypt(${body.code}, ${row.panel_code_hash}) = ${row.panel_code_hash}) AS correcto
    `)
    const isCorrect = Boolean((result[0] as { correcto?: boolean } | undefined)?.correcto)

    if (!isCorrect) {
      const newAttempts = (row.failed_attempts ?? 0) + 1
      const shouldLock = newAttempts >= MAX_FAILS
      // Se pasan como texto ISO: postgres.js no serializa objetos Date dentro de sql``
      const lockedIso = shouldLock
        ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
        : null

      await db.execute(sql`
        UPDATE admin_settings
        SET failed_attempts = ${shouldLock ? 0 : newAttempts},
            locked_until = ${lockedIso}::timestamptz,
            updated_at = NOW()
        WHERE user_id = ${user.id}
      `)

      if (shouldLock) {
        return NextResponse.json(
          { error: `Demasiados intentos. Bloqueado ${LOCK_MINUTES} minutos.`, locked: true },
          { status: 423 },
        )
      }

      const remaining = MAX_FAILS - newAttempts
      return NextResponse.json(
        { error: `Código incorrecto. ${remaining} intento(s) restante(s).`, remaining },
        { status: 401 },
      )
    }

    await db.execute(sql`
      UPDATE admin_settings
      SET failed_attempts = 0, locked_until = NULL, last_unlock_at = NOW(), updated_at = NOW()
      WHERE user_id = ${user.id}
    `)

    await setAdminCookie(user.id, true)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error en verify-code:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
