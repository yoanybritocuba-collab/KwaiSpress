import { Header } from '@/components/layout/header'
import { NuevoProductoForm } from '@/components/admin/nuevo-producto-form'
import { requireSellerPage } from '@/lib/auth/seller-page'
import { getCategoriesWithSubcategories } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function NuevoProductoVendedorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireSellerPage(slug)
  const categorias = await getCategoriesWithSubcategories()

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="px-5 py-8 lg:px-8">
        <NuevoProductoForm
          categorias={categorias}
          volverHref={`/vendedor/${slug}/panel`}
          volverLabel="Volver a mi panel"
          destino={`/vendedor/${slug}/panel`}
        />
      </div>
    </main>
  )
}
