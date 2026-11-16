import Link from 'next/link'
import { asc, desc, eq, and, isNull, ne, or, sql } from 'drizzle-orm'
import { ArrowLeft, Lock } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/roles'
import { getChatAccess } from '@/lib/chat/access'
import { db } from '@/lib/db'
import { chats, messages, products, sellers, users } from '@/lib/db/schema'
import { isUuid } from '@/lib/utils'
import { ChatBox } from '@/components/chat/chat-box'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Chat · KwaiSpress', robots: { index: false } }

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  const user = await getCurrentUser()
  const userId = user?.id

  const access = id && isUuid(id) ? await getChatAccess(id) : null

  // Sin sesión y sin chat propio: no hay nada que mostrar
  if (!userId && !access) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--background)] p-6 text-center text-[var(--foreground)]">
        <div>
          <Lock className="mx-auto mb-4 text-white/40" size={32} />
          <h1 className="mb-2 text-2xl font-bold">Chat privado</h1>
          <p className="mb-6 max-w-sm text-sm text-white/60">
            Para hablar con un vendedor entra en un producto y pulsa «Enviar mensaje». Si eres vendedor, inicia sesión.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/" className="rounded-xl bg-[#3ecf8e] px-5 py-3 text-sm font-bold text-black">Ir a la tienda</Link>
            <Link href="/login?next=/chat" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold">Soy vendedor</Link>
          </div>
        </div>
      </main>
    )
  }

  // Lista de chats (solo usuarios con sesión: vendedores o clientes registrados)
  let misChats: {
    id: string; productTitle: string; label: string; lastMessageAt: Date; unread: number
  }[] = []

  if (userId) {
    const [mySeller] = await db.select({ id: sellers.id }).from(sellers).where(eq(sellers.userId, userId)).limit(1)
    const unread = sql<number>`(select count(*)::int from ${messages} where ${messages.chatId} = ${chats.id} and ${messages.readAt} is null and ${messages.senderId} <> ${userId})`

    const rows = await db
      .select({
        id: chats.id,
        productTitle: products.title,
        guestName: chats.guestName,
        customerName: users.name,
        storeName: sellers.storeName,
        sellerUserId: sellers.userId,
        lastMessageAt: chats.lastMessageAt,
        unread,
      })
      .from(chats)
      .innerJoin(products, eq(chats.productId, products.id))
      .innerJoin(sellers, eq(chats.sellerId, sellers.id))
      .leftJoin(users, eq(chats.customerId, users.id))
      .where(or(eq(chats.customerId, userId), mySeller ? eq(chats.sellerId, mySeller.id) : undefined))
      .orderBy(desc(chats.lastMessageAt))

    misChats = rows.map((r) => ({
      id: r.id,
      productTitle: r.productTitle,
      label: r.sellerUserId === userId ? (r.guestName ?? r.customerName ?? 'Cliente') : r.storeName,
      lastMessageAt: r.lastMessageAt,
      unread: r.unread,
    }))
  }

  // Chat abierto
  let active: { id: string; productTitle: string; subtitle: string } | null = null
  let initial: { id: string; content: string; createdAt: string; mine: boolean }[] = []

  if (access) {
    const [info] = await db
      .select({ productTitle: products.title, storeName: sellers.storeName })
      .from(chats)
      .innerJoin(products, eq(chats.productId, products.id))
      .innerJoin(sellers, eq(chats.sellerId, sellers.id))
      .where(eq(chats.id, access.chat.id))
      .limit(1)

    active = {
      id: access.chat.id,
      productTitle: info?.productTitle ?? 'Producto',
      subtitle:
        access.role === 'seller'
          ? `Cliente: ${access.chat.guestName ?? 'Cliente'}${access.chat.guestEmail ? ` · ${access.chat.guestEmail}` : ''}`
          : `Vendedor: ${info?.storeName ?? ''}`,
    }

    // Al abrir el chat, lo recibido se marca como leído
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(and(eq(messages.chatId, access.chat.id), isNull(messages.readAt), ne(messages.senderId, access.userId)))

    const rows = await db.select().from(messages).where(eq(messages.chatId, access.chat.id)).orderBy(asc(messages.createdAt))
    initial = rows.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      mine: m.senderId === access.userId,
    }))
  }

  const showList = !!userId

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href={showList ? '/perfil' : '/'} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[#d4af37]">
            <ArrowLeft size={16} /> {showList ? 'Volver al perfil' : 'Volver a la tienda'}
          </Link>
        </div>
      </header>

      <div className={`mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 ${showList ? 'md:grid-cols-[320px_1fr]' : 'max-w-3xl'}`}>
        {showList && (
          <div className={`overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0a0a0a] ${active ? 'hidden md:block' : ''}`}>
            <h2 className="border-b border-[var(--border)] p-4 font-bold">Mis chats</h2>
            <div className="max-h-[70vh] divide-y divide-[var(--border)] overflow-y-auto">
              {misChats.length === 0 && <p className="p-4 text-sm text-white/50">Aún no tienes conversaciones.</p>}
              {misChats.map((c) => (
                <Link
                  key={c.id}
                  href={`/chat?id=${c.id}`}
                  className={`flex items-center gap-3 p-4 transition-colors hover:bg-white/5 ${active?.id === c.id ? 'bg-white/10' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`truncate ${c.unread ? 'font-bold' : 'font-medium'}`}>{c.productTitle}</p>
                    <p className="mt-1 truncate text-xs text-white/50">{c.label}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="grid min-w-5 place-items-center rounded-full bg-[#3ecf8e] px-1.5 text-[10px] font-bold leading-5 text-black">
                      {c.unread}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0a0a0a]">
          {active ? (
            <>
              <div className="border-b border-[var(--border)] bg-[#111] p-4">
                {showList && (
                  <Link href="/chat" className="mb-2 inline-flex items-center gap-1 text-xs text-white/50 md:hidden">
                    <ArrowLeft size={12} /> Todos los chats
                  </Link>
                )}
                <h2 className="font-bold">{active.productTitle}</h2>
                <p className="mt-1 text-xs text-white/50">{active.subtitle}</p>
              </div>
              <ChatBox key={active.id} chatId={active.id} initialMessages={initial} />
            </>
          ) : (
            <div className="grid h-[50vh] place-items-center p-6 text-center text-sm text-white/40">
              {id ? 'No tienes acceso a este chat.' : 'Selecciona un chat para empezar a hablar'}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}