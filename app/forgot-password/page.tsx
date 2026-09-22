'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Mail, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const redirectTo = `${window.location.origin}/auth/update-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#0a0a0a] p-12 lg:flex lg:flex-col lg:justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="KwaiSpress"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-white text-black transition-colors group-hover:bg-[#d4af37]">
              <Zap size={18} strokeWidth={2.5} />
            </span>
            <span className="text-lg font-black tracking-tight">
              <span className="text-white">Kwai</span>
              <span className="text-[#10b77f]">Spress</span>
            </span>
          </Link>

          <div className="relative z-10 max-w-md">
            <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-[#10b77f]/10 blur-3xl" />
            <h2 className="text-4xl font-black leading-tight tracking-tight">
              Recupera
              <br />
              <span className="text-white/40">el acceso.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Te enviaremos un enlace seguro a tu correo para que puedas elegir
              una nueva contraseña.
            </p>
          </div>

          <p className="text-xs text-white/30">© 2026 KwaiSpress</p>
        </div>

        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/"
              className="mb-10 flex items-center gap-2.5 lg:hidden"
              aria-label="KwaiSpress"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-white text-black">
                <Zap size={18} strokeWidth={2.5} />
              </span>
              <span className="text-lg font-black tracking-tight">
                <span className="text-white">Kwai</span>
                <span className="text-[#10b77f]">Spress</span>
              </span>
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
              Recuperar contraseña
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Introduce tu email y te enviaremos un enlace para restablecerla.
            </p>

            {sent ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-[#10b77f]/20 bg-[#10b77f]/[0.06] px-4 py-4 text-sm text-[#10b77f]">
                  ✅ Te hemos enviado un correo. Revisa tu bandeja de entrada y
                  spam.
                </div>
                <button
                  onClick={() => {
                    setSent(false)
                    setEmail('')
                  }}
                  className="w-full rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  Enviar a otro email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0a] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d4af37]/50"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    'Enviando...'
                  ) : (
                    <>
                      Enviar enlace <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-white/50">
              ¿Recordaste tu contraseña?{' '}
              <Link
                href="/login"
                className="font-semibold text-white transition-colors hover:text-[#d4af37]"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}