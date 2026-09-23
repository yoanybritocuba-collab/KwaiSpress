import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  MessageCircle,
  MapPin,
  Check,
  Shield,
  Package,
  Sparkles,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ProductGrid } from '@/components/product/product-grid'
import { getProductFull, getSimilarProducts } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { and, eq, desc, sql } from 'drizzle-orm'
import { ProductGallery } from '@/components/product/product-gallery'

export const dynamic = 'force-dynamic'

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const resultado = await getProductFull(id)

  if (!resultado) notFound()

  const { product, seller, category, ofertas } = resultado

  /* Productos similares */
  const similaresRaw = await getSimilarProducts(id, 10)

  const similares = similaresRaw.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    imageUrl: p.imageUrl,
    badge: p.badge,
    rating: p.rating ? Number(p.rating) : 0,
    reviewsCount: p.reviewsCount || 0,
    sellerName: 'Vendedor',
    categoryId: p.categoryId || null,
  }))

  /* Otros productos del mismo vendedor */
  const otrosRaw = seller
    ? await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.sellerId, seller.id),
            eq(products.status, 'published'),
            sql`${products.id} != ${id}`,
          ),
        )
        .orderBy(desc(products.createdAt))
        .limit(6)
    : []

  const otros = otrosRaw.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    imageUrl: p.imageUrl,
    badge: p.badge,
    rating: p.rating ? Number(p.rating) : 0,
    reviewsCount: p.reviewsCount || 0,
    sellerName: seller?.storeName || 'Vendedor',
    categoryId: p.categoryId || null,
  }))

  /* Lista de vendedores */
  const listaVendedores =
    ofertas.length > 0
      ? ofertas
          .filter((o) => o.seller)
          .map((o) => ({
            sellerId: o.seller!.id,
            storeName: o.seller!.storeName,
            slug: o.seller!.slug,
            whatsapp: o.seller!.whatsapp,
            location: o.seller!.location,
            verified: o.seller!.verified,
            price: Number(o.offer.price),
            oldPrice: o.offer.oldPrice ? Number(o.offer.oldPrice) : null,
          }))
      : seller
        ? [
            {
              sellerId: seller.id,
              storeName: seller.storeName,
              slug: seller.slug,
              whatsapp: seller.whatsapp,
              location: seller.location,
              verified: seller.verified,
              price: Number(product.price),
              oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
            },
          ]
        : []

  listaVendedores.sort((a, b) => a.price - b.price)

  const imagenes =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : []

  const tieneOferta =
    product.oldPrice && Number(product.oldPrice) > Number(product.price)

  const descuento = tieneOferta
    ? Math.round(
        ((Number(product.oldPrice) - Number(product.price)) /
          Number(product.oldPrice)) *
          100,
      )
    : 0

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      {/* Breadcrumb */}
      <section className="border-b border-[var(--border)] px-5 py-4 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Link href="/" className="transition-colors hover:text-[#ffd700]">
            Inicio
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link
                href={`/categoria/${category.slug}`}
                className="transition-colors hover:text-[#ffd700]"
              >
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="truncate font-medium text-[var(--foreground)]">
            {product.title}
          </span>
        </div>
      </section>

      {/* Producto */}
      <section className="px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700]"
          >
            <ArrowLeft size={14} />
            Volver
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
            <ProductGallery
              imagenes={imagenes}
              titulo={product.title}
              descuento={tieneOferta ? descuento : null}
              badge={product.badge}
            />

            <div>
              {category && (
                <Link
                  href={`/categoria/${category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#ffd700]/30 bg-[#ffd700]/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ffd700] transition-colors hover:bg-[#ffd700]/10"
                >
                  {category.icon} {category.name}
                </Link>
              )}

              <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {product.title}
              </h1>

              {product.rating && Number(product.rating) > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i <= Math.round(Number(product.rating))
                            ? 'fill-[#ffd700] text-[#ffd700]'
                            : 'text-[var(--muted-foreground)]/30'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {Number(product.rating).toFixed(1)}
                  </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    · {product.reviewsCount} reseñas
                  </span>
                </div>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold">
                  {Number(product.price).toFixed(2)} €
                </span>
                {tieneOferta && (
                  <>
                    <span className="text-lg text-[var(--muted-foreground)] line-through">
                      {Number(product.oldPrice).toFixed(2)} €
                    </span>
                    <span className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
                      -{descuento}%
                    </span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="mt-6 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {product.description}
                </p>
              )}

              {/* Vendedores */}
              {listaVendedores.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                    <Package size={14} className="text-[#3ecf8e]" />
                    {listaVendedores.length}{' '}
                    {listaVendedores.length === 1
                      ? 'vendedor disponible'
                      : 'vendedores disponibles'}
                  </h3>

                  <div className="space-y-2">
                    {listaVendedores.map((v, i) => (
                      <div
                        key={v.sellerId}
                        className={`rounded-2xl border p-4 transition-all ${
                          i === 0
                            ? 'border-[#3ecf8e]/40 bg-[#3ecf8e]/[0.03]'
                            : 'border-[var(--border)] bg-[var(--card)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium">
                                {v.storeName}
                              </p>
                              {i === 0 && (
                                <span className="shrink-0 rounded-full bg-[#3ecf8e]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#3ecf8e]">
                                  Mejor precio
                                </span>
                              )}
                              {v.verified && (
                                <Check
                                  size={12}
                                  className="shrink-0 text-[#3ecf8e]"
                                />
                              )}
                            </div>
                            {v.location && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                                <MapPin size={10} />
                                {v.location}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-display text-lg font-bold">
                              {v.price.toFixed(2)} €
                            </p>
                            {v.oldPrice && v.oldPrice > v.price && (
                              <p className="text-xs text-[var(--muted-foreground)] line-through">
                                {v.oldPrice.toFixed(2)} €
                              </p>
                            )}
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/${(v.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, me interesa "${product.title}" (${v.price.toFixed(2)} €). ¿Está disponible?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3ecf8e] px-4 py-3 text-sm font-bold text-black transition-all hover:bg-[#ffd700]"
                        >
                          <MessageCircle size={15} />
                          Contactar por WhatsApp
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confianza */}
              <div className="mt-6 space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Shield size={13} className="text-[#3ecf8e]" />
                  Vendedores verificados
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <MessageCircle size={13} className="text-[#3ecf8e]" />
                  Contacto directo sin intermediarios
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Sparkles size={13} className="text-[#ffd700]" />
                  Precios actualizados
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Especificaciones */}
      {(product.brand ||
        product.material ||
        product.condition ||
        product.stock !== null) && (
        <section className="border-t border-[var(--border)] px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">
              Especificaciones
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.brand && (
                <SpecItem label="Marca" value={product.brand} />
              )}
              {product.material && (
                <SpecItem label="Material" value={product.material} />
              )}
              {product.condition && (
                <SpecItem
                  label="Estado"
                  value={
                    product.condition === 'nuevo'
                      ? 'Nuevo'
                      : product.condition === 'como-nuevo'
                        ? 'Como nuevo'
                        : 'Usado'
                  }
                />
              )}
              {product.stock !== null && (
                <SpecItem
                  label="Stock"
                  value={`${product.stock} unidades`}
                />
              )}
              {product.sku && <SpecItem label="SKU" value={product.sku} />}
            </div>
          </div>
        </section>
      )}

      {/* Similares */}
      {similares.length > 0 && (
        <section className="border-t border-[var(--border)] px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">
              Productos similares
            </h2>
            <ProductGrid products={similares} />
          </div>
        </section>
      )}

      {/* Más del vendedor */}
      {otros.length > 0 && seller && (
        <section className="border-t border-[var(--border)] px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Más de {seller.storeName}
              </h2>
              <Link
                href={`/vendedor/${seller.slug}`}
                className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700]"
              >
                Ver toda la tienda
              </Link>
            </div>
            <ProductGrid products={otros} />
          </div>
        </section>
      )}
    </main>
  )
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}