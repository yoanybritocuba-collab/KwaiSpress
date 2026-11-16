import { db } from './index'
import { chats, messages, users, sellers, products } from './schema'
import { eq, and, desc, asc, or } from 'drizzle-orm'

// 1. Obtener o crear un chat entre un cliente y un vendedor por un producto
export async function getOrCreateChat(customerId: string, sellerId: string, productId: string) {
  const existing = await db.select()
    .from(chats)
    .where(
      and(
        eq(chats.customerId, customerId),
        eq(chats.sellerId, sellerId),
        eq(chats.productId, productId)
      )
    ).limit(1)

  if (existing[0]) return existing[0]

  const [newChat] = await db.insert(chats)
    .values({ customerId, sellerId, productId })
    .returning()
  return newChat
}

// 2. Obtener los mensajes de un chat
export async function getMessages(chatId: string) {
  return db.select({
    id: messages.id,
    content: messages.content,
    senderId: messages.senderId,
    createdAt: messages.createdAt,
  })
  .from(messages)
  .where(eq(messages.chatId, chatId))
  .orderBy(asc(messages.createdAt))
}

// 3. Enviar un mensaje
export async function sendMessage(chatId: string, senderId: string, content: string) {
  const [msg] = await db.insert(messages)
    .values({ chatId, senderId, content })
    .returning()
  
  // Actualizar la fecha del último mensaje en el chat
  await db.update(chats)
    .set({ lastMessageAt: new Date() })
    .where(eq(chats.id, chatId))
    
  return msg
}

// 4. Obtener los chats de un usuario (cliente o vendedor)
export async function getUserChats(userId: string, isSeller: boolean) {
  const condition = isSeller 
    ? eq(chats.sellerId, userId) // Nota: Aquí necesitas el ID del vendedor, no del usuario
    : eq(chats.customerId, userId)

  // Esta consulta asume que el ID que pasas es el correcto según el rol.
  // Haremos un join para traer el nombre del producto y del otro usuario.
  const rows = await db.select({
    id: chats.id,
    productId: chats.productId,
    productTitle: products.title,
    lastMessageAt: chats.lastMessageAt,
    otherPartyName: isSeller ? users.name : sellers.storeName,
  })
  .from(chats)
  .innerJoin(products, eq(chats.productId, products.id))
  .innerJoin(users, eq(chats.customerId, users.id))
  .innerJoin(sellers, eq(chats.sellerId, sellers.id))
  .where(condition)
  .orderBy(desc(chats.lastMessageAt))

  return rows
}