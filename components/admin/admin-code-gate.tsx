'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Loader2, AlertCircle, Lock } from 'lucide-react'

const SESSION_KEY = 'kwaisspress-panel-code-verified'

export function AdminCodeGate({
  children,
}: {
  children: React.ReactNode
}) {
  const [status, setStatus] = useState<
    'loading' | 'locked' | 'unlocked'
  >('loading')

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)

  useEffect(() => {
    /* ¿Ya verificado en esta sesión? */
    const verified = sessionStorage.getItem(SESSION_KEY) === 'true'

    if (verified) {
      setStatus('unlocked')
    } else {
      setStatus('locked')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setAttemptsLeft(null)

    try {
      const res = await fetch('/api/admin/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al verificar')
        setAttemptsLeft(data.remaining ?? null)
        setSubmitting(false)
        setCode('')
        return
      }

      sessionStorage.setItem(SESSION_KEY, 'true')
      setStatus('unlocked')
    } catch {
      setError('Error de conexión')
      setSubmitting(false)
    }
  }

  /* ------------------ RENDER ------------------ */

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-black">
        <Loader2 className="animate-spin text-[#ffd700]" size={32} />
      </div>
    )
  }

  if (status === 'locked') {
    return (
      <div className="grid min-h-screen place-items-center bg-black px-4">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[#0a0a0a] p-8 sm:p-10">
          <div className="text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#ffd700]/30 bg-[#ffd700]/[0.06]">
              <KeyRound size={28} className="text-[#ffd700]" />
            </span>

            <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-white">
              Panel completo
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Introduce el código de acceso para entrar al panel completo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Código de acceso
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="password"
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="•.••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-black py-3 pl-10 pr-4 text-center font-mono text-lg tracking-widest text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ffd700]/50"
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
              disabled={submitting || !code}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd700] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#ffd700]/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  Verificar código
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-white/30">
            Este código es secreto. No lo compartas con nadie.
          </p>
        </div>
      </div>
    )
  }

  /* unlocked */
  return <>{children}</>
}