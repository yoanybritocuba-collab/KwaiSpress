import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sellers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Verificar que es admin
  const role =
    (userData.user.user_metadata?.role as string) ||
    (userData.user.app_metadata?.role as string) ||
    'customer'

  if (role !== 'admin') {
    return NextResponse.json({ error: 'Solo admins' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { status } = body as { status: 'approved' | 'pending' | 'suspended' }

  if (!['approved', 'pending', 'suspended'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  await db.update(sellers).set({ status }).where(eq(sellers.id, id))

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const role =
    (userData.user.user_metadata?.role as string) ||
    (userData.user.app_metadata?.role as string) ||
    'customer'

  if (role !== 'admin') {
    return NextResponse.json({ error: 'Solo admins' }, { status: 403 })
  }

  const { id } = await params

  await db.delete(sellers).where(eq(sellers.id, id))

  return NextResponse.json({ ok: true })
}