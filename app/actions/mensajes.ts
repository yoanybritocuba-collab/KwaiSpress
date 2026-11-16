'use server'

import { getCurrentUser } from '@/lib/auth/roles'
import { db } from '@/lib/db'
import { chats, messages, sellers, users } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function iniciarChatInvitado(productId: string, sellerId: string, guestName: string, guestEmail: string) {
  try {
    let user = await getCurrentUser()
    let customerId = user?.id

    if (!customerId) {
      customerId = randomUUID()
      await db.insert(users).values({
        id: customerId,
        email: `${customerId}@invitado.local`,
        name: guestName,
        role: 'customer'
      }).onConflictDoNothing()
    }

    const sellerRows = await db.select().from(sellers).where(eq(sellers.id, sellerId)).limit(1)
    if (sellerRows[0]?.userId === customerId) return { error: 'No puedes enviarte mensajes a ti mismo.' }

    const existingChat = await db.select().from(chats).where(
      and(
        eq(chats.sellerId, sellerId),
        eq(chats.productId, productId),
        eq(chats.guestEmail, guestEmail)
      )
    ).limit(1)

    if (existingChat[0]) return { chatId: existingChat[0].id }

    const [newChat] = await db.insert(chats).values({
      customerId: customerId,
      sellerId: sellerId,
      productId: productId,
      guestName: guestName,
      guestEmail: guestEmail
    }).returning()

    return { chatId: newChat.id }
  } catch (error: any) {
    console.error('Error crítico en iniciarChatInvitado:', error)
    return { error: `Error interno: ${error.message || 'Desconocido'}` }
  }
}

export async function enviarMensaje(chatId: string, content: string) {
  try {
    const user = await getCurrentUser()
    let senderId = user?.id

    if (!senderId) {
      const chatRows = await db.select().from(chats).where(eq(chats.id, chatId)).limit(1)
      if (!chatRows[0]) return { error: 'Chat no encontrado.' }
      senderId = chatRows[0].customerId
    }

    if (!content.trim()) return { error: 'El mensaje no puede estar vacío.' }

    await db.insert(messages).values({
      chatId,
      senderId: senderId as any,
      content: content.trim(),
    })

    await db.update(chats)
      .set({ lastMessageAt: new Date() })
      .where(eq(chats.id, chatId))

    return { success: true }
  } catch (error: any) {
    console.error('Error al enviar mensaje:', error)
    return { error: `Error interno: ${error.message || 'Desconocido'}` }
  }
}