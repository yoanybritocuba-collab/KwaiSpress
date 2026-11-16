import { NextResponse } from 'next/server'
import { and, desc, eq, isNull, ne, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { chats, messages, sellers } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ count: 0, latest: null })

  const [seller] = await db.select({ id: sellers.id }).from(sellers).where(eq(sellers.userId, user.id)).limit(1)

  const cond = and(
    isNull(messages.readAt),
    ne(messages.senderId, user.id),
    or(eq(chats.customerId, user.id), seller ? eq(chats.sellerId, seller.id) : undefined),
  )

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(messages)
    .innerJoin(chats, eq(messages.chatId, chats.id))
    .where(cond)

  let latest = null
  if (n > 0) {
    const [row] = await db
      .select({ chatId: messages.chatId, text: messages.content, guestName: chats.guestName, storeName: sellers.storeName })
      .from(messages)
      .innerJoin(chats, eq(messages.chatId, chats.id))
      .innerJoin(sellers, eq(chats.sellerId, sellers.id))
      .where(cond)
      .orderBy(desc(messages.createdAt))
      .limit(1)
    if (row) latest = { chatId: row.chatId, text: row.text.slice(0, 120), from: row.guestName ?? row.storeName }
  }

  return NextResponse.json({ count: n, latest }, { headers: { 'Cache-Control': 'no-store' } })
}