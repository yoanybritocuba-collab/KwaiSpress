import Link from 'next/link'
import { ArrowLeft, Eye } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ProductsTable } from '@/components/admin/products-table'
import { requireSellerPage } from '@/lib/auth/seller-page'
import { getProductsBySeller } from '@/lib/db/queries-admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mi panel · KwaiSpress', robots: { index: false } }

export default async function PanelVendedorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { seller } = await requireSellerPage(slug)
  const productos = await getProductsBySeller(seller.id)

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <Link href="/perfil" className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[#ffd700]">
          <ArrowLeft size={14} /> Volver a mi perfil
        </Link>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{seller.storeName}</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Gestiona los productos de tu tienda.</p>
          </div>
          <Link href={`/vendedor/${seller.slug}`} className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[#ffd700]/40">
            <Eye size={15} /> Ver mi tienda pública
          </Link>
        </div>
        <ProductsTable
          productos={productos}
          newHref={`/vendedor/${seller.slug}/panel/productos/nuevo`}
          editHref={`/vendedor/${seller.slug}/panel/productos/{id}/editar`}
        />
      </div>
    </main>
  )
}
