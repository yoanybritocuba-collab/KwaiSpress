import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chats, sellers } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth/roles'

export const guestCookie = (chatId: string) => `kp_chat_${chatId.replace(/-/g, '')}`

export type ChatAccess = {
  chat: typeof chats.$inferSelect
  role: 'seller' | 'guest'
  userId: string
} | null

/** Quién eres en este chat. null = sin acceso. */
export async function getChatAccess(chatId: string): Promise<ChatAccess> {
  const [chat] = await db.select().from(chats).where(eq(chats.id, chatId)).limit(1)
  if (!chat) return null

  const user = await getCurrentUser()
  if (user) {
    const [seller] = await db
      .select({ userId: sellers.userId })
      .from(sellers)
      .where(eq(sellers.id, chat.sellerId))
      .limit(1)
    if (seller?.userId === user.id) return { chat, role: 'seller', userId: user.id }
    if (chat.customerId === user.id) return { chat, role: 'guest', userId: user.id }
  }

  const token = (await cookies()).get(guestCookie(chatId))?.value
  if (token && chat.guestToken && token === chat.guestToken) {
    return { chat, role: 'guest', userId: chat.customerId }
  }
  return null
}