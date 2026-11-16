import { ProductsTable } from '@/components/admin/products-table'
import { requireAdminPage } from '@/lib/auth/admin-session'
import { ensureAdminSeller } from '@/lib/auth/actor'
import { getProductsBySeller } from '@/lib/db/queries-admin'

export const dynamic = 'force-dynamic'

export default async function MisProductosPage() {
  const user = await requireAdminPage('/admin/mi-tienda/productos')
  const seller = await ensureAdminSeller(user)
  const productos = await getProductsBySeller(seller.id)

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Mis productos</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">Gestiona el catálogo de tu tienda oficial.</p>
      </div>
      <ProductsTable
        productos={productos}
        newHref="/admin/mi-tienda/productos/nuevo"
        editHref="/admin/mi-tienda/productos/{id}/editar"
        canModerate
      />
    </div>
  )
}
