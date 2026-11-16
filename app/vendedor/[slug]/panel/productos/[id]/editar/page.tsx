import { notFound } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { Header } from '@/components/layout/header'
import { EditarProductoForm } from '@/components/admin/editar-producto-form'
import { requireSellerPage } from '@/lib/auth/seller-page'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { getCategoriesWithSubcategories } from '@/lib/db/queries'
import { isUuid } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function EditarProductoVendedorPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params
  const { seller } = await requireSellerPage(slug)
  if (!isUuid(id)) notFound()

  // Solo puede editar productos de su propia tienda
  const [p] = await db.select().from(products).where(and(eq(products.id, id), eq(products.sellerId, seller.id))).limit(1)
  if (!p) notFound()

  const categorias = await getCategoriesWithSubcategories()

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <EditarProductoForm
        categorias={categorias}
        volverHref={`/vendedor/${slug}/panel`}
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
    </main>
  )
}
