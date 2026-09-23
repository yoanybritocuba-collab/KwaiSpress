import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sellers, products } from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import Link from 'next/link'
import {
  Package,
  Plus,
  Eye,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MiTiendaPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) redirect('/login')

  /* Buscar la tienda del admin */
  const sellerRows = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, userData.user.id))
    .limit(1)

  const seller = sellerRows[0]

  if (!seller) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-8 text-center">
          <p className="text-lg font-bold">No tienes tienda de admin</p>
          <p className="mt-2 text-sm text-white/50">
            Contacta con soporte o crea una tienda primero.
          </p>
        </div>
      </div>
    )
  }

  /* Estadísticas de tu tienda */
  const [productos] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.sellerId, seller.id))

  const [publicados] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(
      and(eq(products.sellerId, seller.id), eq(products.status, 'published')),
    )

  /* Últimos productos de tu tienda */
  const misProductos = await db
    .select()
    .from(products)
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(products.createdAt))
    .limit(5)

  const stats = [
    {
      label: 'Productos totales',
      value: String(productos?.count || 0),
      icon: Package,
      tone: 'text-[#ffd700]',
    },
    {
      label: 'Productos publicados',
      value: String(publicados?.count || 0),
      icon: Eye,
      tone: 'text-[#3ecf8e]',
    },
    {
      label: 'Visitas este mes',
      value: '0',
      icon: TrendingUp,
      tone: 'text-sky-400',
    },
    {
      label: 'Ventas este mes',
      value: '0 €',
      icon: DollarSign,
      tone: 'text-[#d4af37]',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      {/* Cabecera */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#ffd700]">
            <Sparkles size={12} />
            Tienda Oficial
          </p>
          <h1 className="text-3xl font-black tracking-tight">
            {seller.storeName}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Gestiona tus productos y controla tu tienda oficial.
          </p>
        </div>
        <Link
          href="/admin/mi-tienda/productos/nuevo"
          className="flex items-center gap-2 rounded-xl bg-[#ffd700] px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-[#ffd700]/90"
        >
          <Plus size={16} />
          Añadir producto
        </Link>
      </div>

      {/* Aviso de admin */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#ffd700]/20 bg-[#ffd700]/[0.03] p-4">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-[#ffd700]" />
        <div>
          <p className="text-sm font-semibold text-[#ffd700]">
            Tienda Oficial KwaiSpress
          </p>
          <p className="mt-1 text-xs text-white/50">
            Tus productos aparecen con prioridad en la web pública, con badge
            &quot;OFICIAL&quot; y son los primeros en las búsquedas.
          </p>
        </div>
      </div>

      {/* Métricas */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <article
            key={label}
            className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#ffd700]/30"
          >
            <Icon size={18} className={tone} />
            <p className="mt-5 text-3xl font-black">{value}</p>
            <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
          </article>
        ))}
      </section>

      {/* Mis productos recientes */}
      <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Mis productos recientes</h2>
            <p className="mt-1 text-xs text-white/40">
              Los últimos que has publicado
            </p>
          </div>
          <Link
            href="/admin/mi-tienda/productos"
            className="text-xs font-medium text-[#ffd700] transition-colors hover:text-[#ffd700]/80"
          >
            Ver todos
          </Link>
        </div>

        {misProductos.length === 0 ? (
          <div className="py-12 text-center">
            <Package size={32} className="mx-auto text-white/20" />
            <p className="mt-4 text-sm font-medium text-white/60">
              No tienes productos todavía
            </p>
            <p className="mt-1 text-xs text-white/40">
              Empieza añadiendo tu primer producto
            </p>
            <Link
              href="/admin/mi-tienda/productos/nuevo"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ffd700] px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#ffd700]/90"
            >
              <Plus size={15} />
              Añadir primer producto
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/[0.06]">
            {misProductos.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[var(--card)]">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-sm text-white/30">
                      📦
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="mt-0.5 text-xs text-white/40">
                    {Number(p.price).toFixed(2)} €
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    p.status === 'published'
                      ? 'bg-[#3ecf8e]/10 text-[#3ecf8e]'
                      : p.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-white/5 text-white/40'
                  }`}
                >
                  {p.status === 'published'
                    ? 'Publicado'
                    : p.status === 'pending'
                      ? 'Pendiente'
                      : p.status}
                </span>
                <Link
                  href={`/admin/mi-tienda/productos/${p.id}/editar`}
                  className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-[#ffd700]/40 hover:text-[#ffd700]"
                >
                  Editar
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Accesos rápidos */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/mi-tienda/productos"
          className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-all hover:-translate-y-0.5 hover:border-[#ffd700]/40"
        >
          <div>
            <Package size={20} className="text-[#3ecf8e]" />
            <p className="mt-3 font-bold">Mis productos</p>
            <p className="mt-1 text-xs text-white/40">
              Gestiona todo tu catálogo
            </p>
          </div>
          <ArrowUpRight
            size={16}
            className="text-white/30 transition-colors group-hover:text-[#ffd700]"
          />
        </Link>

        <Link
          href={`/vendedor/${seller.slug}`}
          className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-all hover:-translate-y-0.5 hover:border-[#ffd700]/40"
        >
          <div>
            <Eye size={20} className="text-[#ffd700]" />
            <p className="mt-3 font-bold">Ver mi tienda pública</p>
            <p className="mt-1 text-xs text-white/40">
              Así la ven los clientes
            </p>
          </div>
          <ArrowUpRight
            size={16}
            className="text-white/30 transition-colors group-hover:text-[#ffd700]"
          />
        </Link>
      </section>
    </div>
  )
}