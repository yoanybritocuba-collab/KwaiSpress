'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
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
        {/* Lado izquierdo — branding */}
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
              Compra, pregunta,
              <br />
              <span className="text-white/40">negocia.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Únete a la comunidad de compradores y vendedores que hablan
              directamente antes de comprar.
            </p>
          </div>

          <p className="text-xs text-white/30">© 2026 KwaiSpress</p>
        </div>

        {/* Lado derecho — formulario */}
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
              Crear cuenta
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Bienvenido a KwaiSpress
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Regístrate para comprar o vender en la plataforma.
            </p>

            <form onSubmit={handleRegister} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Nombre completo
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                  />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0a] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d4af37]/50"
                  />
                </div>
              </div>

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
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
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
                  'Creando cuenta...'
                ) : (
                  <>
                    Crear cuenta <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              ¿Ya tienes cuenta?{' '}
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