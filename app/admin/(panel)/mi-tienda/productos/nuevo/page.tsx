import { NuevoProductoForm } from '@/components/admin/nuevo-producto-form'
import { requireAdminPage } from '@/lib/auth/admin-session'
import { getCategoriesWithSubcategories } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function NuevoProductoPage() {
  await requireAdminPage('/admin/mi-tienda/productos/nuevo')
  const categorias = await getCategoriesWithSubcategories()

  return (
    <div className="p-4 sm:p-8">
      <NuevoProductoForm
        categorias={categorias}
        volverHref="/admin/mi-tienda"
        volverLabel="Volver a mi tienda"
        destino="/admin/mi-tienda/productos"
      />
    </div>
  )
}
