import { redirect } from 'next/navigation'
import { getActor } from './actor'

/** Solo el dueño de la tienda (aprobada) entra a su panel. */
export async function requireSellerPage(slug: string) {
  const actor = await getActor()
  if (!actor) redirect(`/login?next=${encodeURIComponent(`/vendedor/${slug}/panel`)}`)
  const seller = actor.seller
  if (!seller || seller.slug !== slug) redirect('/perfil')
  if (seller.status !== 'approved') redirect('/perfil')
  return { user: actor.user, seller }
}
