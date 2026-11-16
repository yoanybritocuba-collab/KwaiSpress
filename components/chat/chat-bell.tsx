'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { playNotificationSound, unlockAudio } from '@/lib/chat/sound'

type Unread = { count: number; latest: { chatId: string; text: string; from: string } | null }

export function ChatBell() {
  const [count, setCount] = useState(0)
  const prev = useRef<number | null>(null)
  const pathname = usePathname()
  const onChat = useRef(false)
  onChat.current = pathname.startsWith('/chat')

  useEffect(() => {
    unlockAudio()
    let stop = false

    const check = async () => {
      try {
        const res = await fetch('/api/chat/unread', { cache: 'no-store' })
        if (!res.ok || stop) return
        const data: Unread = await res.json()
        setCount(data.count)

        const hayNuevo = prev.current !== null && data.count > prev.current
        const viendoChat = onChat.current && document.visibilityState === 'visible'
        if (hayNuevo && !viendoChat) {
          playNotificationSound()
          if ('Notification' in window && Notification.permission === 'granted') {
            const n = new Notification(`Nuevo mensaje${data.latest ? ` de ${data.latest.from}` : ''}`, {
              body: data.latest?.text,
              tag: 'kwaispress-chat',
            })
            n.onclick = () => {
              window.focus()
              window.location.href = `/chat?id=${data.latest?.chatId}`
            }
          }
        }
        prev.current = data.count

        const base = document.title.replace(/^\(\d+\)\s*/, '')
        document.title = data.count > 0 ? `(${data.count}) ${base}` : base
      } catch {
        /* sin conexión */
      }
    }

    check()
    const t = setInterval(check, 8000)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [])

  return (
    <Link
      href="/chat"
      aria-label={count > 0 ? `${count} mensajes sin leer` : 'Mis chats'}
      onClick={() => {
        if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
      }}
      className="relative grid size-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] transition-colors hover:border-[#3ecf8e]/60"
    >
      <MessageCircle size={17} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid min-w-5 animate-pulse place-items-center rounded-full bg-[#3ecf8e] px-1 text-[10px] font-bold leading-5 text-black">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}