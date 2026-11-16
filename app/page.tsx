import { HomeClient } from './home-client'
import {
  getCategories,
  getPublishedProducts,
  getOfertasDelDia,
  getNovedades,
  getMasVendidos,
} from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [categorias, productos, ofertas, novedades, masVendidos] = await Promise.all([
    getCategories(),
    getPublishedProducts(100),
    getOfertasDelDia(10),
    getNovedades(10),
    getMasVendidos(10),
  ])

  return (
    <HomeClient
      categorias={categorias}
      productos={productos}
      ofertas={ofertas}
      novedades={novedades}
      masVendidos={masVendidos}
    />
  )
}
