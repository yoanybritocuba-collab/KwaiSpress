'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SESSION_KEY = 'kwaisspress-admin-unlocked'

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  const [status, setStatus] = useState<
    'loading' | 'locked' | 'unlocked' | 'not-admin' | 'not-logged'
  >('loading')

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      /* 1. ¿Ya desbloqueado en esta sesión? */
      const unlocked = sessionStorage.getItem(SESSION_KEY) === 'true'

      /* 2. ¿Está logueado? */
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setStatus('not-logged')
        setTimeout(() => router.push('/login'), 1500)
        return
      }

      /* 3. ¿Es admin? */
      const role =
        (data.user.user_metadata?.role as string) ||
        (data.user.app_metadata?.role as string) ||
        'customer'

      if (role !== 'admin') {
        setStatus('not-admin')
        setTimeout(() => router.push('/'), 1500)
        return
      }

      /* 4. ¿Ya introdujo la contraseña en esta sesión? */
      if (unlocked) {
        setStatus('unlocked')
        return
      }

      /* 5. Pedir contraseña */
      setStatus('locked')
    }

    init()
  }, [router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al verificar')
        setSubmitting(false)
        setPassword('')
        return
      }

      sessionStorage.setItem(SESSION_KEY, 'true')
      setStatus('unlocked')
    } catch {
      setError('Error de conexión')
      setSubmitting(false)
    }
  }

  /* ---------- RENDER ---------- */

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-black">
        <Loader2 className="animate-spin text-[#ffd700]" size={32} />
      </div>
    )
  }

  if (status === 'not-logged') {
    return (
      <div className="grid min-h-screen place-items-center bg-black px-4">
        <div className="text-center">
          <AlertCircle size={40} className="mx-auto text-red-400" />
          <p className="mt-4 text-lg font-semibold text-white">
            Debes iniciar sesión primero
          </p>
          <p className="mt-2 text-sm text-white/50">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  if (status === 'not-admin') {
    return (
      <div className="grid min-h-screen place-items-center bg-black px-4">
        <div className="text-center">
          <AlertCircle size={40} className="mx-auto text-red-400" />
          <p className="mt-4 text-lg font-semibold text-white">
            No tienes permisos de administrador
          </p>
          <p className="mt-2 text-sm text-white/50">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  if (status === 'locked') {
    return (
      <div className="grid min-h-screen place-items-center bg-black px-4">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[#0a0a0a] p-8 sm:p-10">
          <div className="text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#ffd700]/30 bg-[#ffd700]/[0.06]">
              <Lock size={28} className="text-[#ffd700]" />
            </span>

            <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-white">
              Acceso restringido
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Introduce la contraseña de administrador para acceder al panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Contraseña de admin
              </label>
              <div className="relative">
                <Shield
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-black py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ffd700]/50"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-400">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd700] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#ffd700]/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Lock size={15} />
                  Acceder al panel
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-white/30">
            Esta contraseña protege el panel de administración
          </p>
        </div>
      </div>
    )
  }

  /* unlocked */
  return <>{children}</>
}