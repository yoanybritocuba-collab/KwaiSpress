import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { sellers } from '@/lib/db/schema'
import { requireAdminApi } from '@/lib/auth/admin-session'
import { isUuid } from '@/lib/utils'

type Ctx = { params: Promise<{ id: string }> }

const STATUSES = ['approved', 'pending', 'suspended'] as const

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { id } = await params
  if (!isUuid(id)) {
    return NextResponse.json({ error: 'Identificador no válido' }, { status: 400 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    status?: string
    verified?: boolean
  }

  const changes: Partial<{ status: (typeof STATUSES)[number]; verified: boolean }> = {}

  if (body.status !== undefined) {
    if (!(STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }
    changes.status = body.status as (typeof STATUSES)[number]
  }
  if (body.verified !== undefined) {
    if (typeof body.verified !== 'boolean') {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }
    changes.verified = body.verified
  }
  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const updated = await db
    .update(sellers)
    .set(changes)
    .where(eq(sellers.id, id))
    .returning({ id: sellers.id })

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 })
  }

  revalidatePath('/admin/vendedores')
  revalidatePath('/vendedores')
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { id } = await params
  if (!isUuid(id)) {
    return NextResponse.json({ error: 'Identificador no válido' }, { status: 400 })
  }

  // Evita que un admin borre accidentalmente su propia tienda oficial
  const [target] = await db
    .select({ userId: sellers.userId })
    .from(sellers)
    .where(eq(sellers.id, id))
    .limit(1)

  if (!target) {
    return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 })
  }
  if (target.userId === auth.user.id) {
    return NextResponse.json(
      { error: 'No puedes eliminar tu propia tienda oficial' },
      { status: 400 },
    )
  }

  await db.delete(sellers).where(eq(sellers.id, id))

  revalidatePath('/admin/vendedores')
  revalidatePath('/vendedores')
  return NextResponse.json({ ok: true })
}
