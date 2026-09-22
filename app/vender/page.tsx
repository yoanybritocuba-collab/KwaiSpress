'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Store, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function VenderPage() {
  const router = useRouter()
  const supabase = createClient()

  const [checking, setChecking] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }

      // ¿Ya tiene solicitud de vendedor?
      const { data: existing } = await supabase
        .from('sellers')
        .select('id, status')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (existing) {
        if (existing.status === 'approved') {
          router.push('/vendedor')
        } else {
          router.push('/perfil')
        }
        return
      }

      setChecking(false)
    }
    init()
  }, [router, supabase])

  // Genera el slug automáticamente desde el nombre
  const handleStoreNameChange = (value: string) => {
    setStoreName(value)
    const generated = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(generated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase.from('sellers').insert({
      user_id: userData.user.id,
      store_name: storeName.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      status: 'pending',
      verified: false,
    })

    if (insertError) {
      if (insertError.message.includes('duplicate')) {
        setError('Ese slug ya está en uso. Prueba con otro nombre de tienda.')
      } else {
        setError(insertError.message)
      }
      setSaving(false)
      return
    }

    // También actualizamos el rol del usuario a "seller"
    // para que al aprobar ya tenga el rol correcto.
    await supabase.auth.updateUser({
      data: { role: 'seller' },
    })

    router.push('/perfil')
    router.refresh()
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="grid place-items-center py-32">
          <Loader2 className="animate-spin text-white/40" size={28} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/[0.06] bg-black/90 px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href="/perfil"
            className="flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-[#d4af37]"
          >
            <ArrowLeft size={16} /> Volver
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#10b77f]/30 bg-[#10b77f]/[0.06] px-3 py-1.5 text-[11px] font-semibold text-[#10b77f]">
            <Store size={12} /> Vender en KwaiSpress
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight">
            Abre tu tienda
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
            Cuéntanos sobre tu negocio. Revisaremos tu solicitud en menos de 24h
            y, si todo está bien, podrás empezar a publicar productos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6">
            <h2 className="mb-5 font-bold">Información de la tienda</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Nombre de la tienda *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={60}
                  value={storeName}
                  onChange={(e) => handleStoreNameChange(e.target.value)}
                  placeholder="Ej: TechLab Store"
                  className="w-full rounded-xl border border-white/[0.08] bg-black px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d4af37]/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  URL de tu tienda *
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black px-4 py-3">
                  <span className="text-sm text-white/40">
                    kwaisspress.com/vendedor/
                  </span>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={60}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="techlab-store"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>
                <p className="mt-2 text-xs text-white/40">
                  Solo letras minúsculas, números y guiones.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Descripción de tu tienda
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cuéntanos qué vendes y qué te hace especial..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-black px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d4af37]/50"
                />
                <p className="mt-2 text-right text-xs text-white/30">
                  {description.length}/500
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6">
            <h2 className="mb-3 font-bold">¿Qué pasa después?</h2>
            <ul className="space-y-2 text-sm text-white/55">
              <li className="flex gap-2">
                <span className="text-[#10b77f]">1.</span>
                Recibimos tu solicitud y la revisamos.
              </li>
              <li className="flex gap-2">
                <span className="text-[#10b77f]">2.</span>
                Te aprobamos (normalmente en menos de 24h).
              </li>
              <li className="flex gap-2">
                <span className="text-[#10b77f]">3.</span>
                Accedes a tu panel de vendedor y publicas tus productos.
              </li>
            </ul>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/perfil"
              className="flex-1 rounded-xl border border-white/[0.08] px-4 py-3 text-center text-sm font-medium text-white/60 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving || !slug || !storeName}
              className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Enviando solicitud...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}