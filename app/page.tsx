import { HomeClient } from './home-client'
import {
  getCategories,
  getPublishedProducts,
  getOfertasDelDia,
  getNovedades,
  getMasVendidos,
} from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

function formatearProductos(productos: any[]) {
  const safe = Array.isArray(productos) ? productos : []
  return safe.map((p) => ({
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
}

export default async function HomePage() {
  const [categorias, todos, ofertas, novedades, masVendidos] =
    await Promise.all([
      getCategories(),
      getPublishedProducts(100),
      getOfertasDelDia(10),
      getNovedades(10),
      getMasVendidos(10),
    ])

  const safeCategorias = Array.isArray(categorias) ? categorias : []

  return (
    <HomeClient
      categorias={safeCategorias}
      productos={formatearProductos(todos)}
      ofertas={formatearProductos(ofertas)}
      novedades={formatearProductos(novedades)}
      masVendidos={formatearProductos(masVendidos)}
    />
  )
}