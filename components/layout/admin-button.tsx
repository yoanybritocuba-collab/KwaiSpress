'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

export function AdminButton() {
  return (
    <Link
      href="/admin"
      className="flex items-center gap-2 rounded-full border border-[#ffd700]/30 bg-[#ffd700]/[0.06] px-4 py-2 text-sm font-medium text-[#ffd700] transition-all hover:border-[#ffd700] hover:bg-[#ffd700] hover:text-black"
    >
      <Shield size={14} />
      <span className="hidden sm:inline">Panel Admin</span>
      <span className="sm:hidden">Admin</span>
    </Link>
  )
}