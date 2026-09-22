'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'

export function FloatingButtons() {
  const router = useRouter()
  const pathname = usePathname()

  /* Determinar a dónde debe ir "Volver" según la sección actual */
  const getBackPath = (): string | null => {
    /* Home → no mostrar botón volver */
    if (pathname === '/') return null

    /* Login, Register, Recuperar contraseña → volver a Home */
    if (
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/forgot-password' ||
      pathname.startsWith('/auth/')
    ) {
      return '/'
    }

    /* Perfil → volver a Home */
    if (pathname === '/perfil' || pathname.startsWith('/perfil/')) {
      return '/'
    }

    /* Vender → volver a Home */
    if (pathname === '/vender') return '/'

    /* Admin → volver a Home */
    if (pathname.startsWith('/admin')) return '/'

    /* Panel de vendedor → volver a Home */
    if (pathname.startsWith('/vendedor/panel')) return '/'

    /* Detalle de producto → volver a Home */
    if (pathname.startsWith('/producto/')) return '/'

    /* Tienda de vendedor → volver a Home */
    if (pathname.startsWith('/vendedor/')) return '/'

    /* Categoría → volver a Home */
    if (pathname.startsWith('/categoria/')) return '/'

    /* Cualquier otra página → volver a Home */
    return '/'
  }

  const backPath = getBackPath()

  const handleBack = () => {
    /* Intentar usar el historial primero */
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back()
      /* Fallback: si después de 100ms no cambió la URL, ir a la ruta conocida */
      setTimeout(() => {
        if (window.location.pathname === pathname) {
          router.push(backPath || '/')
        }
      }, 100)
    } else {
      /* Si no hay historial, ir a la ruta conocida */
      router.push(backPath || '/')
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-2.5">
      {/* Botón Volver */}
      {backPath && (
        <button
          onClick={handleBack}
          className="group flex size-12 items-center justify-center rounded-full border border-[var(--border)] bg-[#0a0a0a]/95 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-[#ffd700]/60 hover:text-[#ffd700] active:scale-95"
          aria-label="Volver atrás"
          title="Volver"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* Botón Home (solo si no estamos ya en la home) */}
      {pathname !== '/' && (
        <button
          onClick={() => router.push('/')}
          className="group flex size-12 items-center justify-center rounded-full border border-[var(--border)] bg-[#0a0a0a]/95 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-[#3ecf8e]/60 hover:text-[#3ecf8e] active:scale-95"
          aria-label="Ir al inicio"
          title="Inicio"
        >
          <Home size={20} />
        </button>
      )}
    </div>
  )
}