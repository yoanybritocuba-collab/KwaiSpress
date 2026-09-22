'use client'

import { useState } from 'react'
import { AdminGate } from '@/components/admin/admin-gate'
import { AdminCodeGate } from '@/components/admin/admin-code-gate'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminGate>
      <AdminCodeGate>
        <div className="flex min-h-screen bg-black text-white">
          <AdminSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

            <main className="flex-1 overflow-x-hidden bg-black px-5 py-8 sm:px-8">
              {children}
            </main>
          </div>
        </div>
      </AdminCodeGate>
    </AdminGate>
  )
}