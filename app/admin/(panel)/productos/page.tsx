import { ProductsTable } from '@/components/admin/products-table'
import { requireAdminPage } from '@/lib/auth/admin-session'
import { getAllProducts } from '@/lib/db/queries-admin'

export const dynamic = 'force-dynamic'

export default async function AdminProductosPage() {
  await requireAdminPage('/admin/productos')
  const productos = await getAllProducts(300)

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Todos los productos</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Gestiona y modera el catálogo global ({productos.length} productos).
        </p>
      </div>

      <ProductsTable
        productos={productos.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          stock: p.stock,
          status: p.status,
          imageUrl: p.imageUrl,
          sellerName: p.sellerName,
        }))}
        newHref="/admin/mi-tienda/productos/nuevo"
        editHref="/admin/mi-tienda/productos/{id}/editar"
        canModerate
        showSeller
        emptyText="Todavía no hay productos en la tienda."
      />
    </div>
  )
}
