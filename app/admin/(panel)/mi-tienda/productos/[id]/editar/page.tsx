import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { EditarProductoForm } from '@/components/admin/editar-producto-form'
import { requireAdminPage } from '@/lib/auth/admin-session'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { getCategoriesWithSubcategories } from '@/lib/db/queries'
import { isUuid } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAdminPage(`/admin/mi-tienda/productos/${id}/editar`)
  if (!isUuid(id)) notFound()

  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1)
  if (!p) notFound()

  const categorias = await getCategoriesWithSubcategories()

  return (
    <EditarProductoForm
      categorias={categorias}
      volverHref="/admin/productos"
      producto={{
        id: p.id,
        title: p.title,
        description: p.description ?? '',
        price: p.price,
        oldPrice: p.oldPrice ?? '',
        stock: p.stock?.toString() ?? '',
        brand: p.brand ?? '',
        material: p.material ?? '',
        condition: p.condition ?? 'nuevo',
        categoryId: p.categoryId ?? '',
        images: p.images && p.images.length ? p.images : p.imageUrl ? [p.imageUrl] : [],
      }}
    />
  )
}
