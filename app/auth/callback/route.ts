import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/utils'

/**
 * Destino de los enlaces de correo de Supabase (confirmar cuenta, recuperar
 * contraseña). Intercambia el código por una sesión en el servidor y
 * redirige a una ruta interna segura.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNextPath(searchParams.get('next'), '/')

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      console.error('Error en auth/callback:', err)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=enlace`)
}
