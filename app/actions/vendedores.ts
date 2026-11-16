'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { sellers, users } from '@/lib/db/schema'
import { getActor, isUniqueViolation } from '@/lib/auth/actor'
import { parseSellerInput, type SellerInput } from '@/lib/validation/product'

/**
 * Solicitud para vender. El estado SIEMPRE nace "pending" y "verified" en
 * false: lo decide el servidor, no el navegador. Un administrador la aprueba
 * desde /admin/vendedores.
 */
export async function solicitarVendedor(
  input: SellerInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await getActor()
  if (!actor) return { ok: false, error: 'Debes iniciar sesión' }
  if (actor.seller) {
    return { ok: false, error: 'Ya tienes una solicitud o una tienda creada' }
  }

  const parsed = parseSellerInput(input)
  if (!parsed.ok) return parsed
  const d = parsed.data

  try {
    // sellers.user_id apunta a users: aseguramos la fila de perfil
    await db
      .insert(users)
      .values({
        id: actor.user.id,
        email: actor.user.email ?? `${actor.user.id}@sin-email.local`,
        name:
          (actor.user.user_metadata?.name as string | undefined) ||
          actor.user.email?.split('@')[0] ||
          'Usuario',
      })
      .onConflictDoNothing()
  } catch (err) {
    console.error('No se pudo asegurar la fila en users:', err)
  }

  try {
    await db.insert(sellers).values({
      userId: actor.user.id,
      storeName: d.storeName,
      slug: d.slug,
      description: d.description,
      whatsapp: d.whatsapp,
      location: d.location,
      status: 'pending',
      verified: false,
    })
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        ok: false,
        error: 'Esa dirección de tienda ya está en uso. Prueba con otro nombre.',
      }
    }
    console.error('Error creando solicitud de vendedor:', err)
    return { ok: false, error: 'No se pudo enviar la solicitud' }
  }

  revalidatePath('/admin/vendedores')
  revalidatePath('/admin')
  return { ok: true }
}
