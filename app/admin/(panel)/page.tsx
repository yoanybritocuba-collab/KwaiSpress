import Link from 'next/link'
import { Package, Users, Store, Tags, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { requireAdminPage } from '@/lib/auth/admin-session'
import { getAdminStats, getLatestProducts, getLatestSellers } from '@/lib/db/queries-admin'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  published: { label: 'Publicado', cls: 'bg-[#3ecf8e]/10 text-[#3ecf8e]' },
  approved: { label: 'Aprobado', cls: 'bg-[#3ecf8e]/10 text-[#3ecf8e]' },
  pending: { label: 'Pendiente', cls: 'bg-yellow-500/10 text-yellow-400' },
  draft: { label: 'Borrador', cls: 'bg-white/5 text-[var(--muted-foreground)]' },
  rejected: { label: 'Rechazado', cls: 'bg-red-500/10 text-red-400' },
  suspended: { label: 'Suspendido', cls: 'bg-red-500/10 text-red-400' },
}

function Badge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { label: status, cls: 'bg-white/5 text-[var(--muted-foreground)]' }
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}

export default async function AdminDashboard() {
  await requireAdminPage('/admin')

  const [stats, latestProducts, latestSellers] = await Promise.all([
    getAdminStats(),
    getLatestProducts(5).catch(() => []),
    getLatestSellers(5).catch(() => []),
  ])

  const cards = [
    {
      label: 'Productos',
      value: stats.productsTotal,
      hint: `${stats.productsPublished} publicados`,
      icon: Package,
      tone: 'bg-blue-500/10 text-blue-400',
      href: '/admin/productos',
    },
    {
      label: 'Vendedores aprobados',
      value: stats.sellersApproved,
      hint: `${stats.sellersPending} pendientes`,
      icon: Users,
      tone: 'bg-[#3ecf8e]/10 text-[#3ecf8e]',
      href: '/admin/vendedores',
    },
    {
      label: 'Categorías',
      value: stats.categoriesTotal,
      hint: 'Gestiona el catálogo',
      icon: Tags,
      tone: 'bg-[#ffd700]/10 text-[#ffd700]',
      href: '/admin/categorias',
    },
    {
      label: 'Usuarios',
      value: stats.usersTotal,
      hint: 'Registrados en la web',
      icon: Users,
      tone: 'bg-purple-500/10 text-purple-400',
      href: '/admin/vendedores',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Panel de Administración</h1>
      <p className="mb-8 text-[var(--muted-foreground)]">
        Resumen en tiempo real de tu marketplace.
      </p>

      {stats.failed && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-4 text-sm text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          No se pudieron cargar las estadísticas. Comprueba la conexión con la base de datos
          (DATABASE_URL).
        </div>
      )}

      {stats.sellersPending > 0 && (
        <Link
          href="/admin/vendedores?estado=pending"
          className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/[0.06] p-4 text-sm text-yellow-200 transition-colors hover:bg-yellow-500/10"
        >
          <span className="flex items-center gap-3">
            <Clock size={18} className="shrink-0" />
            Tienes {stats.sellersPending} solicitud{stats.sellersPending !== 1 ? 'es' : ''} de
            vendedor pendiente{stats.sellersPending !== 1 ? 's' : ''} de revisar.
          </span>
          <ArrowUpRight size={16} />
        </Link>
      )}

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon, tone, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-colors hover:border-[#ffd700]/40"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={`rounded-xl p-3 ${tone}`}>
                <Icon size={22} />
              </div>
              <h3 className="text-sm font-medium text-[var(--muted-foreground)]">{label}</h3>
            </div>
            <p className="text-4xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Últimos productos</h2>
            <Link href="/admin/productos" className="text-xs font-medium text-[#ffd700]">
              Ver todos
            </Link>
          </div>
          {latestProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              Todavía no hay productos.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {latestProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-[var(--background)]">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-sm">📦</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {Number(p.price).toFixed(2)} €
                    </p>
                  </div>
                  <Badge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Últimos vendedores</h2>
            <Link href="/admin/vendedores" className="text-xs font-medium text-[#ffd700]">
              Ver todos
            </Link>
          </div>
          {latestSellers.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              Todavía no hay vendedores.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {latestSellers.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#3ecf8e]/15 font-bold text-[#3ecf8e]">
                    {s.storeName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.storeName}</p>
                    <p className="truncate text-xs text-[var(--muted-foreground)]">/{s.slug}</p>
                  </div>
                  <Badge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <Store size={20} className="text-[var(--muted-foreground)]" />
        <Link
          href="/admin/mi-tienda/productos/nuevo"
          className="rounded-xl bg-[#ffd700] px-5 py-2 text-sm font-bold text-black hover:bg-[#ffd700]/90"
        >
          Añadir producto
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-bold hover:bg-[var(--background)]"
        >
          Ir a la web
        </Link>
      </div>
    </div>
  )
}
