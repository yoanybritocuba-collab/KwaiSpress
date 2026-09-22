'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Store,
  Settings,
  Shield,
  Clock,
  CheckCircle2,
  MessageCircle,
  Heart,
  Package,
  LayoutDashboard,
  XCircle,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type UserData = {
  id: string
  email: string
  name: string
  role: string
}

type SellerInfo = {
  id: string
  store_name: string
  slug: string
  description: string | null
  status: 'pending' | 'approved' | 'suspended'
  created_at: string
} | null

type Tab = 'comprar' | 'vender' | 'ajustes'

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(null)
  const [seller, setSeller] = useState<SellerInfo>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('comprar')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name:
          (data.user.user_metadata?.name as string) ||
          data.user.email?.split('@')[0] ||
          'Usuario',
        role:
          (data.user.user_metadata?.role as string) ||
          (data.user.app_metadata?.role as string) ||
          'customer',
      })

      const { data: sellerData } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (sellerData) {
        setSeller(sellerData as SellerInfo)
      }

      setLoading(false)
    }
    load()
  }, [router, supabase])

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="grid place-items-center py-32">
          <Loader2 className="animate-spin text-white/40" size={28} />
        </div>
      </main>
    )
  }

  if (!user) return null

  const initial = user.name.charAt(0).toUpperCase()
  const isAdmin = user.role === 'admin'
  const isSellerApproved = seller?.status === 'approved'

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-[#d4af37]"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Volver a la tienda</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tarjeta de usuario */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#10b77f] text-xl font-black text-black sm:size-16 sm:text-2xl">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold sm:text-xl">
                {user.name}
              </p>
              <p className="truncate text-xs text-white/50 sm:text-sm">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="mt-6 overflow-x-auto sm:overflow-visible">
          <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-1 sm:inline-flex">
            <button
              onClick={() => setTab('comprar')}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === 'comprar'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:bg-white/[0.04] hover:text-[#d4af37]'
              }`}
            >
              <Heart size={15} />
              Comprar
            </button>

            <button
              onClick={() => setTab('vender')}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === 'vender'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:bg-white/[0.04] hover:text-[#d4af37]'
              }`}
            >
              <Store size={15} />
              Vender
            </button>

            <button
              onClick={() => setTab('ajustes')}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === 'ajustes'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:bg-white/[0.04] hover:text-[#d4af37]'
              }`}
            >
              <Settings size={15} />
              Ajustes
            </button>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <div className="mt-6">
          {/* ==================== COMPRAR ==================== */}
          {tab === 'comprar' && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/perfil/chats"
                  className="group rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#d4af37]/40"
                >
                  <MessageCircle
                    size={20}
                    className="text-[#10b77f] transition-colors group-hover:text-[#d4af37]"
                  />
                  <h3 className="mt-4 font-bold">Mis chats</h3>
                  <p className="mt-1 text-xs text-white/50">
                    Conversaciones con vendedores
                  </p>
                </Link>

                <Link
                  href="/perfil/favoritos"
                  className="group rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#d4af37]/40"
                >
                  <Heart
                    size={20}
                    className="text-[#10b77f] transition-colors group-hover:text-[#d4af37]"
                  />
                  <h3 className="mt-4 font-bold">Mis favoritos</h3>
                  <p className="mt-1 text-xs text-white/50">
                    Productos que has guardado
                  </p>
                </Link>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
                <User size={18} className="text-white/40" />
                <h3 className="mt-3 font-bold">Mis datos</h3>
                <p className="mt-1 text-xs text-white/50">
                  Nombre y email asociados a tu cuenta.
                </p>
                <button
                  disabled
                  className="mt-4 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/40"
                >
                  Editar (próximamente)
                </button>
              </div>
            </div>
          )}

          {/* ==================== VENDER ==================== */}
          {tab === 'vender' && (
            <div className="space-y-4">
              {/* Sin solicitud */}
              {!seller && !isAdmin && (
                <div className="rounded-2xl border border-[#10b77f]/20 bg-[#10b77f]/[0.03] p-6 text-center sm:p-8">
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#10b77f]/10 text-[#10b77f]">
                    <Store size={28} />
                  </span>
                  <h3 className="mt-5 text-xl font-black tracking-tight">
                    ¿Quieres vender en KwaiSpress?
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
                    Publica tus productos, gestiona tus chats y llega a nuevos
                    clientes. Todo desde tu panel.
                  </p>
                  <Link
                    href="/vender"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#d4af37]"
                  >
                    Quiero vender aquí
                  </Link>
                </div>
              )}

              {/* Solicitud pendiente */}
              {seller?.status === 'pending' && (
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.03] p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <Clock size={24} className="shrink-0 text-yellow-400" />
                    <div>
                      <h3 className="text-lg font-bold">Solicitud en revisión</h3>
                      <p className="mt-1 text-sm text-white/55">
                        Tu tienda <strong>{seller.store_name}</strong> está
                        siendo revisada por nuestro equipo. Te avisaremos cuando
                        esté aprobada.
                      </p>
                      <p className="mt-2 text-xs text-white/40">
                        Enviada el{' '}
                        {new Date(seller.created_at).toLocaleDateString(
                          'es-ES',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suspendido */}
              {seller?.status === 'suspended' && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <XCircle size={24} className="shrink-0 text-red-400" />
                    <div>
                      <h3 className="text-lg font-bold">Tienda suspendida</h3>
                      <p className="mt-1 text-sm text-white/55">
                        Tu tienda <strong>{seller.store_name}</strong> ha sido
                        suspendida temporalmente. Contacta con soporte para más
                        información.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendedor aprobado */}
              {isSellerApproved && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#10b77f]/20 bg-[#10b77f]/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-[#10b77f]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{seller?.store_name}</p>
                        <p className="truncate text-xs text-white/50">
                          /vendedor/{seller?.slug}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Link
                      href="/vendedor/productos"
                      className="group rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#d4af37]/40"
                    >
                      <Package
                        size={20}
                        className="text-[#10b77f] transition-colors group-hover:text-[#d4af37]"
                      />
                      <h3 className="mt-4 font-bold">Mis productos</h3>
                      <p className="mt-1 text-xs text-white/50">
                        Crear, editar y gestionar
                      </p>
                    </Link>

                    <Link
                      href="/vendedor/chats"
                      className="group rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#d4af37]/40"
                    >
                      <MessageCircle
                        size={20}
                        className="text-[#10b77f] transition-colors group-hover:text-[#d4af37]"
                      />
                      <h3 className="mt-4 font-bold">Mis chats</h3>
                      <p className="mt-1 text-xs text-white/50">
                        Conversaciones con clientes
                      </p>
                    </Link>

                    <Link
                      href="/vendedor/perfil"
                      className="group rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#d4af37]/40"
                    >
                      <Store
                        size={20}
                        className="text-[#10b77f] transition-colors group-hover:text-[#d4af37]"
                      />
                      <h3 className="mt-4 font-bold">Mi tienda</h3>
                      <p className="mt-1 text-xs text-white/50">
                        Nombre, logo y descripción
                      </p>
                    </Link>

                    <Link
                      href="/vendedor"
                      className="group rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#d4af37]/40"
                    >
                      <LayoutDashboard
                        size={20}
                        className="text-[#10b77f] transition-colors group-hover:text-[#d4af37]"
                      />
                      <h3 className="mt-4 font-bold">Dashboard</h3>
                      <p className="mt-1 text-xs text-white/50">
                        Estadísticas y resumen
                      </p>
                    </Link>
                  </div>
                </div>
              )}

              {/* Admin */}
              {isAdmin && !seller && (
                <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/[0.03] p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <Shield size={24} className="shrink-0 text-[#d4af37]" />
                    <div>
                      <h3 className="text-lg font-bold">Eres administrador</h3>
                      <p className="mt-1 text-sm text-white/55">
                        No necesitas ser vendedor. Tienes acceso total al panel
                        de administración.
                      </p>
                      <Link
                        href="/admin"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/30 px-4 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
                      >
                        <Shield size={15} />
                        Ir al panel admin
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== AJUSTES ==================== */}
          {tab === 'ajustes' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
                <h3 className="font-bold">Cuenta</h3>
                <p className="mt-1 text-xs text-white/50">
                  Gestiona tu seguridad y datos personales.
                </p>

                <div className="mt-5 space-y-2">
                  <Link
                    href="/auth/update-password"
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:border-[#d4af37]/40 hover:text-[#d4af37]"
                  >
                    <span>Cambiar contraseña</span>
                    <span className="text-white/30">→</span>
                  </Link>

                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      router.push('/')
                      router.refresh()
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <span>Cerrar sesión</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="block rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/[0.03] p-5 transition-colors hover:border-[#d4af37]/40"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-[#d4af37]" />
                    <div>
                      <p className="font-bold">Panel de administración</p>
                      <p className="text-xs text-white/50">
                        Control total de la plataforma
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}