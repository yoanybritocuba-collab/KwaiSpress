import { NextResponse } from 'next/server'
import {
  adminRequiresCode,
  clearAdminCookie,
  passwordMatches,
  setAdminCookie,
} from '@/lib/auth/admin-session'
import { getCurrentUser, isAdminUser } from '@/lib/auth/roles'
import { checkLock, registerFailure, registerSuccess } from '@/lib/rate-limit'

/** Paso 1 del desbloqueo del panel: contraseña de administrador. */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión primero' }, { status: 401 })
    }
    if (!isAdminUser(user)) {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 },
      )
    }

    const adminPassword = process.env.ADMIN_PANEL_PASSWORD
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Panel no configurado: falta ADMIN_PANEL_PASSWORD en el servidor' },
        { status: 500 },
      )
    }

    const key = `admin-pw:${user.id}`
    const lock = checkLock(key)
    if (lock.locked) {
      return NextResponse.json(
        { error: `Demasiados intentos. Inténtalo en ${lock.minutesLeft} minuto(s).`, locked: true },
        { status: 429 },
      )
    }

    const body = (await request.json().catch(() => ({}))) as { password?: unknown }
    if (typeof body.password !== 'string' || !body.password) {
      return NextResponse.json({ error: 'Falta la contraseña' }, { status: 400 })
    }

    if (!passwordMatches(body.password, adminPassword)) {
      const res = registerFailure(key)
      if (res.locked) {
        return NextResponse.json(
          { error: 'Demasiados intentos. Bloqueado 15 minutos.', locked: true },
          { status: 429 },
        )
      }
      return NextResponse.json(
        { error: `Contraseña incorrecta. ${res.remaining} intento(s) restante(s).` },
        { status: 401 },
      )
    }

    registerSuccess(key)

    const needsCode = await adminRequiresCode(user.id)
    const ok = await setAdminCookie(user.id, false)
    if (!ok) {
      return NextResponse.json({ error: 'No se pudo iniciar la sesión del panel' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, needsCode })
  } catch (err) {
    console.error('Error en /api/admin/auth:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

/** Vuelve a bloquear el panel (cerrar sesión del panel). */
export async function DELETE() {
  await clearAdminCookie()
  return NextResponse.json({ ok: true })
}
