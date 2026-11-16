import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Star, MessageCircle, MapPin, Check, Shield, Package, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductGrid } from '@/components/product/product-grid'
import { getProductFull, getSimilarProducts, getSellerProducts } from '@/lib/db/queries'
import { getCurrentUser, isAdminUser } from '@/lib/auth/roles'
import { isUuid } from '@/lib/utils'
import { ProductGallery } from '@/components/product/product-gallery'
import { StartChatButton } from '@/components/chat/start-chat-button'

export const dynamic = 'force-dynamic'

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const user = await getCurrentUser()
  const resultado = await getProductFull(id, { includeUnpublished: isAdminUser(user) })
  if (!resultado) notFound()

  const { product, seller, category, ofertas } = resultado

  const [similares, otros] = await Promise.all([
    getSimilarProducts(id, 10),
    seller ? getSellerProducts(seller.id, id, 6) : Promise.resolve([]),
  ])

  const listaVendedores =
    ofertas.length > 0
      ? ofertas
          .filter((o) => o.seller)
          .map((o) => ({
            sellerId: o.seller!.id,
            storeName: o.seller!.storeName,
            slug: o.seller!.slug,
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

  const tieneOferta = product.oldPrice && Number(product.oldPrice) > Number(product.price)
  const descuento = tieneOferta
    ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
    : 0

  const specs: { label: string; value: string }[] = (
    [
      ['Marca', product.brand],
      ['Estado', product.condition],
      ['Material', product.material],
      ['Colores', product.colors?.join(', ')],
      ['Tallas', product.sizes?.join(', ')],
      ['Dimensiones', product.dimensions],
      ['Peso', product.weight ? `${product.weight} g` : null],
      ['Garantía', product.warrantyMonths ? `${product.warrantyMonths} meses` : null],
      ['Referencia', product.sku],
    ] as [string, string | null | undefined][]
  )
    .filter(([, v]) => !!v)
    .map(([label, value]) => ({ label, value: value as string }))

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <section className="border-b border-[var(--border)] px-5 py-4 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Link href="/" className="hover:text-[#ffd700]">Inicio</Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/categorias?cat=${category.slug}`} className="hover:text-[#ffd700]">{category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="truncate font-medium text-[var(--foreground)]">{product.title}</span>
        </div>
      </section>

      <section className="px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[#ffd700]">
            <ArrowLeft size={14} /> Volver
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_440px]">
            <ProductGallery
              imagenes={imagenes}
              titulo={product.title}
              descuento={tieneOferta ? descuento : null}
              badge={product.badge}
            />

            <div>
              {category && (
                <Link
                  href={`/categorias?cat=${category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#ffd700]/30 bg-[#ffd700]/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ffd700] hover:bg-[#ffd700]/10"
                >
                  {category.icon} {category.name}
                </Link>
              )}

              <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{product.title}</h1>

              {product.rating && Number(product.rating) > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i <= Math.round(Number(product.rating)) ? 'fill-[#ffd700] text-[#ffd700]' : 'text-[var(--muted-foreground)]/30'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{Number(product.rating).toFixed(1)}</span>
                  <span className="text-sm text-[var(--muted-foreground)]">· {product.reviewsCount} reseñas</span>
                </div>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold">{Number(product.price).toFixed(2)} €</span>
                {tieneOferta && (
                  <>
                    <span className="text-lg text-[var(--muted-foreground)] line-through">{Number(product.oldPrice).toFixed(2)} €</span>
                    <span className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">-{descuento}%</span>
                  </>
                )}
              </div>

              {product.stock != null && product.stock > 0 && product.stock <= 5 && (
                <p className="mt-3 text-xs font-semibold text-amber-400">¡Quedan solo {product.stock} unidades!</p>
              )}
              {product.stock === 0 && (
                <p className="mt-3 text-xs font-semibold text-red-400">Agotado. Pregunta al vendedor por disponibilidad.</p>
              )}

              {product.description && (
                <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-[var(--muted-foreground)]">{product.description}</p>
              )}

              <div className="mt-8">
                <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-bold">
                  <Package size={14} className="text-[#3ecf8e]" />
                  {listaVendedores.length === 0
                    ? 'Sin vendedores disponibles'
                    : `${listaVendedores.length} ${listaVendedores.length === 1 ? 'vendedor disponible' : 'vendedores disponibles'}`}
                </h3>

                <div className="space-y-2">
                  {listaVendedores.map((v, i) => (
                    <div
                      key={v.sellerId}
                      className={`rounded-2xl border p-4 ${
                        i === 0 ? 'border-[#3ecf8e]/40 bg-[#3ecf8e]/[0.04]' : 'border-[var(--border)] bg-[var(--card)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/vendedor/${v.slug}`} className="truncate font-medium hover:text-[#ffd700]">
                              {v.storeName}
                            </Link>
                            {i === 0 && listaVendedores.length > 1 && (
                              <span className="shrink-0 rounded-full bg-[#3ecf8e]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#3ecf8e]">
                                Mejor precio
                              </span>
                            )}
                            {v.verified && <Check size={12} className="shrink-0 text-[#3ecf8e]" aria-label="Verificado" />}
                          </div>
                          {v.location && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                              <MapPin size={10} />
                              {v.location}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-display text-lg font-bold">{v.price.toFixed(2)} €</p>
                          {v.oldPrice && v.oldPrice > v.price && (
                            <p className="text-xs text-[var(--muted-foreground)] line-through">{v.oldPrice.toFixed(2)} €</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <StartChatButton productId={product.id} sellerId={v.sellerId} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]"><Shield size={13} className="text-[#3ecf8e]" />Vendedores verificados</div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]"><MessageCircle size={13} className="text-[#3ecf8e]" />Chat privado y directo, sin crear cuenta</div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]"><Sparkles size={13} className="text-[#ffd700]" />Compra acordada con el vendedor en el chat</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {specs.length > 0 && (
        <section className="border-t border-[var(--border)] px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">Especificaciones</h2>
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
              {specs.map((s) => (
                <div key={s.label} className="flex justify-between gap-4 bg-[var(--card)] px-5 py-3 text-sm">
                  <dt className="text-[var(--muted-foreground)]">{s.label}</dt>
                  <dd className="text-right font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {otros.length > 0 && seller && (
        <section className="border-t border-[var(--border)] px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Más de {seller.storeName}</h2>
              <Link href={`/vendedor/${seller.slug}`} className="text-sm text-[#3ecf8e] hover:text-[#ffd700]">Ver tienda →</Link>
            </div>
            <ProductGrid products={otros} />
          </div>
        </section>
      )}

      {similares.length > 0 && (
        <section className="border-t border-[var(--border)] px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">Productos similares</h2>
            <ProductGrid products={similares} />
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}