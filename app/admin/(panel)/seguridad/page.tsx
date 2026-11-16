import { SeguridadClient } from '@/components/admin/seguridad-client'
import { requireAdminPage } from '@/lib/auth/admin-session'

export const dynamic = 'force-dynamic'

export default async function SeguridadPage() {
  await requireAdminPage('/admin/seguridad')
  return (
    <div className="p-4 sm:p-8">
      <SeguridadClient />
    </div>
  )
}
