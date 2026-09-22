import Link from 'next/link'
import { Zap } from 'lucide-react'

export function Logo({
  compact = false,
  href = '/',
}: {
  compact?: boolean
  href?: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5"
      aria-label="KwaiSpress"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-white text-black transition-colors group-hover:bg-[#d4af37]">
        <Zap size={18} strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="text-lg font-black tracking-tight">
          <span className="text-white">Kwai</span>
          <span className="text-[#10b77f] transition-colors group-hover:text-[#d4af37]">
            Spress
          </span>
        </span>
      )}
    </Link>
  )
}