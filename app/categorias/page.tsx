import { getCategoriesWithSubcategories, getPublishedProducts } from '@/lib/db/queries'
import { CategoriasClient } from './categorias-client'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const [categorias, productos] = await Promise.all([
    getCategoriesWithSubcategories(),
    getPublishedProducts(50),
  ])

  const safeProductos = Array.isArray(productos) ? productos : []

  const formateados = safeProductos.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    imageUrl: p.imageUrl,
    badge: p.badge,
    rating: p.rating ? Number(p.rating) : 0,
    reviewsCount: p.reviewsCount || 0,
    sellerName: 'Vendedor',
  }))

  return <CategoriasClient categorias={categorias} productos={formateados} />
}