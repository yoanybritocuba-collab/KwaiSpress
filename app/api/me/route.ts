import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { sellers } from '@/lib/db/schema'
import { getCurrentUser, isAdminUser } from '@/lib/auth/roles'

/**
 * Datos de la sesión calculados en el servidor (rol verificado).
 * Los componentes de cliente usan esto en lugar de leer `user_metadata`.
 */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ user: null })
  }

  let seller: {
    id: string
    storeName: string
    slug: string
    status: 'pending' | 'approved' | 'suspended'
    verified: boolean
    createdAt: string
  } | null = null

  try {
    const rows = await db
      .select({
        id: sellers.id,
        storeName: sellers.storeName,
        slug: sellers.slug,
        status: sellers.status,
        verified: sellers.verified,
        createdAt: sellers.createdAt,
      })
      .from(sellers)
      .where(eq(sellers.userId, user.id))
      .limit(1)
    if (rows[0]) seller = { ...rows[0], createdAt: rows[0].createdAt.toISOString() }
  } catch (err) {
    console.error('Error en /api/me:', err)
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? '',
      name:
        (user.user_metadata?.name as string | undefined) ||
        user.email?.split('@')[0] ||
        'Usuario',
      isAdmin: isAdminUser(user),
    },
    seller,
  })
}
