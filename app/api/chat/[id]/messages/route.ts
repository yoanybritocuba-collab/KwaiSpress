import { NextResponse } from 'next/server'
import { and, asc, eq, isNull, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { messages } from '@/lib/db/schema'
import { getChatAccess } from '@/lib/chat/access'
import { isUuid } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const access = await getChatAccess(id)
  if (!access) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // Solo se marca como leído si la pestaña está visible (lo decide el cliente)
  if (new URL(req.url).searchParams.get('read') === '1') {
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(and(eq(messages.chatId, id), isNull(messages.readAt), ne(messages.senderId, access.userId)))
  }

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, id))
    .orderBy(asc(messages.createdAt))
    .limit(500)

  return NextResponse.json(
    {
      messages: rows.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        mine: m.senderId === access.userId,
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}