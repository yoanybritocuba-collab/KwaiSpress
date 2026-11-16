import { AdminShell } from '@/components/admin/shell'
import { requireAdminPage } from '@/lib/auth/admin-session'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Panel de administración · KwaiSpress', robots: { index: false } }

/**
 * Protección en el SERVIDOR: solo entra un administrador real con el panel
 * desbloqueado. Antes bastaba con haber iniciado sesión.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage('/admin')

  const userName =
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Admin'

  return (
    <AdminShell userName={userName} userEmail={user.email ?? ''}>
      {children}
    </AdminShell>
  )
}
