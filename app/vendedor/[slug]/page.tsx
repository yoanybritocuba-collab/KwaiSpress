import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Package, BadgeCheck } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductGrid } from '@/components/product/product-grid'
import { db } from '@/lib/db'
import { sellers } from '@/lib/db/schema'
import { getSellerProducts } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function VendedorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [seller] = await db.select().from(sellers).where(eq(sellers.slug, slug)).limit(1)
  if (!seller) notFound()

  // Las tiendas pendientes o suspendidas solo las ve su propietario
  if (seller.status !== 'approved') {
    const user = await getCurrentUser()
    if (user?.id !== seller.userId) notFound()
  }

  const productos = await getSellerProducts(seller.id)

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="relative overflow-hidden border-b border-[var(--border)] px-5 py-10 lg:px-8">
        <div className="hero-glow pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-7xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[#ffd700]">
            <ArrowLeft size={16} /> Volver
          </Link>

          <div className="flex flex-wrap items-center gap-6">
            <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-[#3ecf8e] to-[#3ecf8e]/60 text-3xl font-bold text-black shadow-lg">
              {seller.storeName.charAt(0).toUpperCase()}
            </span>

            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{seller.storeName}</h1>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
                {seller.location && (
                  <span className="flex items-center gap-1.5"><MapPin size={14} />{seller.location}</span>
                )}
                <span className="flex items-center gap-1.5"><Package size={14} />{productos.length} productos</span>
                {seller.verified && (
                  <span className="flex items-center gap-1.5 text-[#3ecf8e]"><BadgeCheck size={14} />Vendedor verificado</span>
                )}
              </div>

              {seller.description && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">{seller.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">Productos</h2>
          <ProductGrid products={productos} emptyMessage="Este vendedor aún no tiene productos" />
        </div>
      </section>

      <Footer />
    </main>
  )
}