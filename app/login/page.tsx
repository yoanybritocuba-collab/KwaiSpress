'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
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
              Bienvenido
              <br />
              <span className="text-white/40">de vuelta.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Accede a tu cuenta para gestionar tus productos, chats y
              favoritos.
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
              Iniciar sesión
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Accede a tu cuenta
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Ingresa con tu email y contraseña.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
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

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0a] py-3 pl-10 pr-12 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d4af37]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/40 transition-colors hover:text-[#d4af37]"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-white/50 transition-colors hover:text-[#d4af37]"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
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
                  'Iniciando sesión...'
                ) : (
                  <>
                    Iniciar sesión <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              ¿No tienes cuenta?{' '}
              <Link
                href="/register"
                className="font-semibold text-white transition-colors hover:text-[#d4af37]"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}