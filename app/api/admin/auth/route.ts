import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    /* 1. Verificar que el usuario está logueado */
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión primero' },
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
        { error: 'No tienes permisos de administrador' },
        { status: 403 },
      )
    }

    /* 3. Verificar la contraseña del panel */
    const body = await request.json()
    const { password } = body as { password?: string }

    if (!password) {
      return NextResponse.json(
        { error: 'Falta la contraseña' },
        { status: 400 },
      )
    }

    const adminPassword = process.env.ADMIN_PANEL_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Panel no configurado correctamente' },
        { status: 500 },
      )
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 },
      )
    }

    /* 4. Todo OK */
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 },
    )
  }
}