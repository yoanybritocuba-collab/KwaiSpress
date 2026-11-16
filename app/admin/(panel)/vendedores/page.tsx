import { SellersTable } from '@/components/admin/sellers-table'
import { requireAdminPage } from '@/lib/auth/admin-session'
import { getAllSellers } from '@/lib/db/queries-admin'

export const dynamic = 'force-dynamic'

export default async function AdminVendedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  await requireAdminPage('/admin/vendedores')
  const { estado } = await searchParams
  const initial = estado === 'pending' || estado === 'approved' || estado === 'suspended' ? estado : 'all'
  const sellers = await getAllSellers()

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Vendedores</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">Aprueba solicitudes, suspende o verifica tiendas.</p>
      </div>
      <SellersTable
        initialFilter={initial}
        sellers={sellers.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
      />
    </div>
  )
}
