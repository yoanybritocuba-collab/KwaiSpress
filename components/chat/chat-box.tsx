'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { enviarMensaje } from '@/app/actions/mensajes'
import { playNotificationSound, unlockAudio } from '@/lib/chat/sound'

export type ChatMsg = { id: string; content: string; createdAt: string; mine: boolean }

export function ChatBox({ chatId, initialMessages }: { chatId: string; initialMessages: ChatMsg[] }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [alertNew, setAlertNew] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const known = useRef(new Set(initialMessages.map((m) => m.id)))

  useEffect(() => unlockAudio(), [])

  const poll = useCallback(async () => {
    try {
      const visible = document.visibilityState === 'visible'
      const res = await fetch(`/api/chat/${chatId}/messages?read=${visible ? 1 : 0}`, { cache: 'no-store' })
      if (!res.ok) return
      const data: { messages: ChatMsg[] } = await res.json()
      const fresh = data.messages.filter((m) => !known.current.has(m.id))
      if (fresh.length === 0) return
      fresh.forEach((m) => known.current.add(m.id))
      setMsgs(data.messages)
      if (fresh.some((m) => !m.mine)) {
        playNotificationSound()
        setAlertNew(true)
        setTimeout(() => setAlertNew(false), 3000)
      }
    } catch {
      /* sin conexión: se reintenta en el siguiente ciclo */
    }
  }, [chatId])

  useEffect(() => {
    const t = setInterval(poll, 3000)
    const onVisible = () => document.visibilityState === 'visible' && poll()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [poll])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    setError('')
    const res = await enviarMensaje(chatId, text)
    if (res?.error) setError(res.error)
    else {
      setText('')
      await poll()
    }
    setSending(false)
  }

  return (
    <div className="relative flex h-[70vh] min-h-[420px] flex-col">
      {alertNew && (
        <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 animate-bounce rounded-full bg-[#3ecf8e] px-4 py-2 text-xs font-bold text-black">
          ¡Nuevo mensaje!
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <p className="mt-10 text-center text-sm text-white/40">Aún no hay mensajes. ¡Escribe el primero!</p>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.mine ? 'rounded-tr-none bg-[#3ecf8e] text-black' : 'rounded-tl-none bg-white/10 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
              <p
                suppressHydrationWarning
                className={`mt-1 text-right text-[10px] ${m.mine ? 'text-black/50' : 'text-white/40'}`}
              >
                {new Date(m.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 pb-1 text-xs text-red-400">{error}</p>}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-[var(--border)] p-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm focus:border-[#3ecf8e] focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Enviar"
          className="rounded-xl bg-[#3ecf8e] px-4 text-black transition-colors hover:bg-[#d4af37] disabled:opacity-50"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  )
}