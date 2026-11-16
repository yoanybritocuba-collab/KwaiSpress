'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, KeyRound, Loader2, AlertCircle } from 'lucide-react'

type Step = 'password' | 'code'

/** Desbloqueo del panel: contraseña de admin y, si existe, código secreto. */
export function UnlockForm({ next }: { next: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('password')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const finish = () => {
    router.replace(next)
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const isPassword = step === 'password'
      const res = await fetch(
        isPassword ? '/api/admin/auth' : '/api/admin/verify-code',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isPassword ? { password: value } : { code: value }),
        },
      )
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        needsCode?: boolean
      }

      if (!res.ok) {
        setError(data.error || 'No se pudo verificar')
        setValue('')
        return
      }

      setValue('')
      if (isPassword && data.needsCode) {
        setStep('code')
      } else {
        finish()
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const isPassword = step === 'password'
  const Icon = isPassword ? Lock : KeyRound

  return (
    <div className="grid min-h-screen place-items-center bg-black px-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[#0a0a0a] p-8 sm:p-10">
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#ffd700]/30 bg-[#ffd700]/[0.06]">
            <Icon size={28} className="text-[#ffd700]" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-white">
            {isPassword ? 'Acceso restringido' : 'Código de acceso'}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {isPassword
              ? 'Introduce la contraseña de administrador para acceder al panel.'
              : 'Introduce tu código secreto para entrar al panel completo.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="unlock-input"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              {isPassword ? 'Contraseña de admin' : 'Código secreto'}
            </label>
            <div className="relative">
              {isPassword ? (
                <Shield
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
              ) : (
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
              )}
              <input
                id="unlock-input"
                type="password"
                required
                autoFocus
                autoComplete={isPassword ? 'current-password' : 'one-time-code'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-black py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#ffd700]/50"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-400"
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !value}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd700] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#ffd700]/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Icon size={15} />
                {isPassword ? 'Acceder al panel' : 'Verificar código'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
