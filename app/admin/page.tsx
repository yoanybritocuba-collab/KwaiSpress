import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  Package,
  ShieldAlert,
  Store,
  Users,
} from 'lucide-react'
import {
  getAdminStats,
  getLatestProducts,
  getLatestSellers,
} from '@/lib/db/queries-admin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [stats, latestProducts, latestSellers] = await Promise.all([
    getAdminStats(),
    getLatestProducts(5),
    getLatestSellers(5),
  ])

  const metrics = [
    {
      label: 'Vendedores activos',
      value: String(stats.sellersApproved),
      detail: `${stats.sellersPending} pendientes · ${stats.sellersSuspended} suspendidos`,
      icon: Store,
      href: '/admin/vendedores',
      tone: 'text-[#3ecf8e]',
    },
    {
      label: 'Productos publicados',
      value: String(stats.productsPublished),
      detail: `${stats.productsTotal} total`,
      icon: Package,
      href: '/admin/productos',
      tone: 'text-[#ffd700]',
    },
    {
      label: 'Productos pendientes',
      value: String(stats.productsPending),
      detail: 'Requieren revisión',
      icon: ShieldAlert,
      href: '/admin/productos',
      tone: 'text-yellow-400',
    },
    {
      label: 'Usuarios registrados',
      value: String(stats.usersTotal),
      detail: `${stats.categoriesTotal} categorías`,
      icon: Users,
      href: '/admin',
      tone: 'text-sky-400',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      {/* Cabecera */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
            Centro de control
          </p>
          <h1 className="text-3xl font-black tracking-tight">
            Buenos días, Director.
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Administra vendedores, productos, conversaciones y toda la
            experiencia.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#3ecf8e]/20 bg-[#3ecf8e]/[0.06] px-3.5 py-1.5 text-xs font-medium text-[#3ecf8e]">
          <span className="size-1.5 rounded-full bg-[#3ecf8e]" /> Sistema
          operativo
        </div>
      </div>

      {/* Métricas */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, href, tone }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-colors hover:border-[#ffd700]/30"
          >
            <div className="flex items-start justify-between">
              <Icon size={18} className={tone} />
              <ArrowUpRight
                size={14}
                className="text-white/20 transition-colors group-hover:text-[#ffd700]"
              />
            </div>
            <p className="mt-5 text-3xl font-black">{value}</p>
            <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
            <p className="mt-1.5 text-xs text-white/40">{detail}</p>
          </Link>
        ))}
      </section>

      {/* Grid 2 columnas */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Últimos productos */}
        <section className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Últimos productos</h2>
              <p className="mt-1 text-xs text-white/40">Los más recientes</p>
            </div>
            <Link
              href="/admin/productos"
              className="text-xs font-medium text-[#ffd700] transition-colors hover:text-[#ffd700]/80"
            >
              Ver todos
            </Link>
          </div>

          {latestProducts.length === 0 ? (
            <p className="py-8 text-center text-xs text-white/40">
              No hay productos todavía
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {latestProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-[var(--card)]">
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
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Últimos vendedores */}
        <section className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Últimos vendedores</h2>
              <p className="mt-1 text-xs text-white/40">
                Solicitudes recientes
              </p>
            </div>
            <Link
              href="/admin/vendedores"
              className="text-xs font-medium text-[#ffd700] transition-colors hover:text-[#ffd700]/80"
            >
              Ver todos
            </Link>
          </div>

          {latestSellers.length === 0 ? (
            <p className="py-8 text-center text-xs text-white/40">
              No hay vendedores todavía
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {latestSellers.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#3ecf8e]/10 text-xs font-bold text-[#3ecf8e]">
                      {s.storeName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {s.storeName}
                      </p>
                      <p className="truncate text-xs text-white/40">
                        /{s.slug}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      s.status === 'approved'
                        ? 'bg-[#3ecf8e]/10 text-[#3ecf8e]'
                        : s.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {s.status === 'approved'
                      ? 'Aprobado'
                      : s.status === 'pending'
                        ? 'Pendiente'
                        : 'Suspendido'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Accesos rápidos */}
      <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-5">
        <h2 className="mb-5 font-bold">Accesos rápidos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAccess
            href="/admin/mi-tienda"
            label="Mi Tienda"
            icon={Store}
          />
          <QuickAccess
            href="/admin/vendedores"
            label="Vendedores"
            icon={Users}
          />
          <QuickAccess
            href="/admin/productos"
            label="Productos"
            icon={Package}
          />
          <QuickAccess
            href="/admin/categorias"
            label="Categorías"
            icon={FolderKanban}
          />
        </div>
      </section>
    </div>
  )
}

function QuickAccess({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0f0f0f] px-4 py-3 text-sm font-medium text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#ffd700]/40 hover:text-[#ffd700]"
    >
      <Icon size={16} />
      {label}
      <ArrowUpRight
        size={13}
        className="ml-auto text-white/30 transition-colors group-hover:text-[#ffd700]"
      />
    </Link>
  )
}