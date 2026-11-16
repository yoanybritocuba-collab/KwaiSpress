import { getCurrentUser } from '@/lib/auth/roles'
import { db } from '@/lib/db'
import { chats, messages, users, products, sellers } from '@/lib/db/schema'
import { eq, or, asc } from 'drizzle-orm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ChatBox } from '@/components/chat/chat-box'

export const dynamic = 'force-dynamic'

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  const user = await getCurrentUser()
  
  if (!user && !id) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Acceso al chat</h1>
          <p className="text-white/60 mb-6">Para ver tus conversaciones, necesitas iniciar sesión o acceder desde un producto.</p>
          <Link href="/login" className="bg-[#3ecf8e] text-black px-6 py-3 rounded-xl font-bold">Iniciar sesión</Link>
        </div>
      </main>
    )
  }

  const userId = user?.id
  const sellerRows = userId ? await db.select().from(sellers).where(eq(sellers.userId, userId)).limit(1) : []
  const sellerId = sellerRows[0]?.id

  let misChats: any[] = []
  if (userId) {
    misChats = await db.select({
      id: chats.id, productId: chats.productId, productTitle: products.title,
      customerName: users.name, guestName: chats.guestName, guestEmail: chats.guestEmail,
      lastMessageAt: chats.lastMessageAt,
    })
    .from(chats)
    .innerJoin(products, eq(chats.productId, products.id))
    .leftJoin(users, eq(chats.customerId, users.id))
    .where(or(eq(chats.customerId, userId), sellerId ? eq(chats.sellerId, sellerId) : undefined))
    .orderBy(chats.lastMessageAt)
  }

  let activeChat = null
  let activeMessages: any[] = []
  
  if (id) {
    const chatRows = await db.select({
      id: chats.id, productId: chats.productId, productTitle: products.title,
      customerName: users.name, guestName: chats.guestName, guestEmail: chats.guestEmail,
      lastMessageAt: chats.lastMessageAt,
    })
    .from(chats)
    .innerJoin(products, eq(chats.productId, products.id))
    .leftJoin(users, eq(chats.customerId, users.id))
    .where(eq(chats.id, id))
    .limit(1)

    if (chatRows[0]) {
      activeChat = chatRows[0]
      const msgs = await db.select().from(messages).where(eq(messages.chatId, id)).orderBy(asc(messages.createdAt))
      activeMessages = msgs || []
    }
  }

  const isGuest = !userId

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href={isGuest ? "/" : "/perfil"} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[#d4af37]"><ArrowLeft size={16} />{isGuest ? 'Volver a la tienda' : 'Volver al perfil'}</Link>
        </div>
      </header>

      <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 grid ${isGuest ? 'grid-cols-1' : 'md:grid-cols-[300px_1fr]'} gap-6`}>
        {!isGuest && (
          <div className="border border-[var(--border)] rounded-2xl bg-[#0a0a0a] overflow-hidden">
            <h2 className="p-4 font-bold border-b border-[var(--border)]">Mis chats</h2>
            <div className="divide-y divide-[var(--border)] h-[500px] overflow-y-auto">
              {misChats.length === 0 && <p className="p-4 text-sm text-white/50">No tienes conversaciones aún.</p>}
              {misChats.map((chat) => (
                <Link key={chat.id} href={`/chat?id=${chat.id}`} className={`block p-4 hover:bg-white/5 transition-colors ${activeChat?.id === chat.id ? 'bg-white/10' : ''}`}>
                  <p className="font-medium truncate">{chat.productTitle}</p>
                  <p className="text-xs text-white/50 mt-1">{chat.guestName ? `${chat.guestName} (${chat.guestEmail})` : `Cliente: ${chat.customerName}`}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="border border-[var(--border)] rounded-2xl bg-[#0a0a0a] overflow-hidden">
          {activeChat ? (
            <>
              <div className="p-4 border-b border-[var(--border)] bg-[#111]">
                <h2 className="font-bold">{activeChat.productTitle}</h2>
                {activeChat.guestName && (<p className="text-xs text-white/50 mt-1">Cliente: {activeChat.guestName} ({activeChat.guestEmail})</p>)}
              </div>
              <ChatBox chatId={activeChat.id} currentUserId={userId || 'invitado'} initialMessages={activeMessages} />
            </>
          ) : (
            <div className="h-[500px] flex items-center justify-center text-white/40">Selecciona un chat para empezar a hablar</div>
          )}
        </div>
      </div>
    </main>
  )
}