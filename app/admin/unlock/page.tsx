import { redirect } from 'next/navigation'
import { UnlockForm } from '@/components/admin/unlock-form'
import { getAdminAccess } from '@/lib/auth/admin-session'
import { safeNextPath } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Acceso al panel · KwaiSpress', robots: { index: false } }

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const target = safeNextPath(next, '/admin')

  const access = await getAdminAccess()
  if (!access.user) redirect(`/login?next=${encodeURIComponent('/admin/unlock')}`)
  if (!access.isAdmin) redirect('/')
  if (access.unlocked) redirect(target)

  // Si ya pasó la contraseña pero falta el código, la UI arranca en el paso 1 igualmente;
  // al reenviar la contraseña correcta pasará al paso del código.
  return <UnlockForm next={target} />
}
