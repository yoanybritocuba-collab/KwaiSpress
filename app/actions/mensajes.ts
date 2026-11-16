'use server'

import { cookies } from 'next/headers'
import { randomBytes, randomUUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import type { User } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { chats, messages, products, sellers, users } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth/roles'
import { getChatAccess, guestCookie } from '@/lib/chat/access'
import { isUuid } from '@/lib/utils'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_LEN = 2000

// Límite sencillo anti-spam: 20 mensajes por minuto y chat
const hits = new Map<string, number[]>()
function tooFast(key: string) {
  const now = Date.now()
  const list = (hits.get(key) ?? []).filter((t) => now - t < 60_000)
  list.push(now)
  hits.set(key, list)
  return list.length > 20
}

async function ensureUserRow(user: User, fallbackName: string) {
  const name =
    (user.user_metadata?.name as string | undefined) || fallbackName || user.email?.split('@')[0] || 'Usuario'
  await db
    .insert(users)
    .values({ id: user.id, email: user.email ?? `${user.id}@sin-email.local`, name })
    .onConflictDoNothing()
}

export async function iniciarChatInvitado(
  productId: string,
  sellerId: string,
  guestName: string,
  guestEmail: string,
) {
  try {
    const name = guestName.trim().slice(0, 60)
    const email = guestEmail.trim().toLowerCase().slice(0, 120)
    if (name.length < 2) return { error: 'Escribe tu nombre.' }
    if (!EMAIL_RE.test(email)) return { error: 'El correo no parece válido.' }
    if (!isUuid(productId) || !isUuid(sellerId)) return { error: 'Producto no válido.' }

    const [seller] = await db
      .select()
      .from(sellers)
      .where(and(eq(sellers.id, sellerId), eq(sellers.status, 'approved')))
      .limit(1)
    if (!seller) return { error: 'Este vendedor no está disponible.' }

    const [product] = await db
      .select({ id: products.id, title: products.title })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)
    if (!product) return { error: 'Producto no encontrado.' }

    const user = await getCurrentUser()
    let customerId: string
    if (user) {
      await ensureUserRow(user, name)
      customerId = user.id
    } else {
      customerId = randomUUID()
      await db.insert(users).values({ id: customerId, email: `${customerId}@invitado.local`, name })
    }

    if (seller.userId === customerId) return { error: 'No puedes escribirte a ti mismo.' }

    // Usuarios con sesión: se reutiliza su chat. Invitados: chat nuevo (nunca se
    // reutiliza por correo, para que nadie pueda entrar en el chat de otro).
    if (user) {
      const [existing] = await db
        .select({ id: chats.id })
        .from(chats)
        .where(and(eq(chats.customerId, customerId), eq(chats.sellerId, sellerId), eq(chats.productId, productId)))
        .limit(1)
      if (existing) return { chatId: existing.id }
    }

    const guestToken = randomBytes(24).toString('hex')
    const [chat] = await db
      .insert(chats)
      .values({ productId, sellerId, customerId, guestName: name, guestEmail: email, guestToken })
      .returning()

    // Primer mensaje automático: el vendedor ve enseguida por qué producto preguntan
    await db.insert(messages).values({
      chatId: chat.id,
      senderId: customerId,
      content: `Hola, me interesa: ${product.title}`,
    })

    ;(await cookies()).set(guestCookie(chat.id), guestToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })

    return { chatId: chat.id }
  } catch (error: any) {
    console.error('Error en iniciarChatInvitado:', error)
    return { error: 'No se pudo iniciar el chat. Inténtalo de nuevo.' }
  }
}

export async function enviarMensaje(chatId: string, content: string) {
  try {
    if (!isUuid(chatId)) return { error: 'Chat no válido.' }
    const text = content.trim()
    if (!text) return { error: 'El mensaje no puede estar vacío.' }
    if (text.length > MAX_LEN) return { error: `Máximo ${MAX_LEN} caracteres.` }

    const access = await getChatAccess(chatId)
    if (!access) return { error: 'No tienes acceso a este chat.' }
    if (tooFast(`${chatId}:${access.userId}`)) return { error: 'Vas demasiado rápido, espera un momento.' }

    await db.insert(messages).values({ chatId, senderId: access.userId, content: text })
    await db.update(chats).set({ lastMessageAt: new Date() }).where(eq(chats.id, chatId))

    return { success: true }
  } catch (error: any) {
    console.error('Error al enviar mensaje:', error)
    return { error: 'No se pudo enviar el mensaje.' }
  }
}