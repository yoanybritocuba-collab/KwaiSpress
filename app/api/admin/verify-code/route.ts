import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    /* 1. Verificar que el usuario está logueado */
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión' },
        { status: 401 },
      )
    }

    /* 2. Verificar que es admin */
    const role =
      (userData.user.user_metadata?.role as string) ||
      (userData.user.app_metadata?.role as string) ||
      'customer'

    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 },
      )
    }

    /* 3. Leer el código enviado */
    const body = await request.json()
    const { code } = body as { code?: string }

    if (!code) {
      return NextResponse.json(
        { error: 'Falta el código' },
        { status: 400 },
      )
    }

    /* 4. Verificar si está bloqueado */
    const settings = await db.execute(sql`
      SELECT 
        panel_code_hash,
        failed_attempts,
        locked_until
      FROM admin_settings
      WHERE user_id = ${userData.user.id}
      LIMIT 1
    `)

    if (!settings || settings.length === 0) {
      return NextResponse.json(
        { error: 'Configuración de admin no encontrada' },
        { status: 500 },
      )
    }

    const row = settings[0] as {
      panel_code_hash: string | null
      failed_attempts: number
      locked_until: string | null
    }

    /* 5. ¿Está bloqueado? */
    if (row.locked_until) {
      const lockedUntil = new Date(row.locked_until)
      if (lockedUntil > new Date()) {
        const minutesLeft = Math.ceil(
          (lockedUntil.getTime() - Date.now()) / 60000,
        )
        return NextResponse.json(
          {
            error: `Bloqueado. Inténtalo en ${minutesLeft} minuto(s).`,
            locked: true,
          },
          { status: 423 },
        )
      }
    }

    /* 6. Verificar el código con crypt */
    const result = await db.execute(sql`
      SELECT crypt(${code}, ${row.panel_code_hash}) = ${row.panel_code_hash} AS correcto
    `)

    const isCorrect = (result[0] as { correcto: boolean })?.correcto

    if (!isCorrect) {
      /* Incrementar intentos fallidos */
      const newAttempts = (row.failed_attempts || 0) + 1
      let lockedUntil: Date | null = null

      if (newAttempts >= 3) {
        /* Bloquear 15 minutos tras 3 intentos */
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
      }

      await db.execute(sql`
        UPDATE admin_settings
        SET 
          failed_attempts = ${newAttempts},
          locked_until = ${lockedUntil},
          updated_at = NOW()
        WHERE user_id = ${userData.user.id}
      `)

      if (lockedUntil) {
        return NextResponse.json(
          {
            error: 'Demasiados intentos. Bloqueado 15 minutos.',
            locked: true,
          },
          { status: 423 },
        )
      }

      const remaining = 3 - newAttempts
      return NextResponse.json(
        {
          error: `Código incorrecto. ${remaining} intento(s) restante(s).`,
          remaining,
        },
        { status: 401 },
      )
    }

    /* 7. ✅ Código correcto — resetear intentos */
    await db.execute(sql`
      UPDATE admin_settings
      SET 
        failed_attempts = 0,
        locked_until = NULL,
        last_unlock_at = NOW(),
        updated_at = NOW()
      WHERE user_id = ${userData.user.id}
    `)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error en verify-code:', err)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 },
    )
  }
}