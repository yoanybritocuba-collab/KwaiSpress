'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { enviarMensaje } from '@/app/actions/mensajes'
import { createClient } from '@/lib/supabase/client'

export function ChatBox({ chatId, currentUserId, initialMessages }: { chatId: string, currentUserId: string, initialMessages: any[] }) {
  const [messages, setMessages] = useState(Array.isArray(initialMessages) ? initialMessages : [])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [newMessageAlert, setNewMessageAlert] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const playSound = () => {
    try {
      const audio = new Audio('/notification.mp3') 
      audio.play().catch(() => console.log('Audio bloqueado por el navegador'))
    } catch (e) {
      console.log('Error al reproducir sonido')
    }
  }

  useEffect(() => {
    if (!chatId) return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (data && data.length > messages.length) {
        const lastMessage = data[data.length - 1]
        if (lastMessage.sender_id !== currentUserId) {
          playSound()
          setNewMessageAlert(true)
          setTimeout(() => setNewMessageAlert(false), 3000)
        }
        setMessages(data)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [chatId, messages.length, currentUserId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return

    setSending(true)
    const res = await enviarMensaje(chatId, text)
    
    if (res?.success) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        chat_id: chatId,
        sender_id: currentUserId,
        content: text,
        created_at: new Date().toISOString(),
      }])
      setText('')
    } else {
      alert(res?.error || 'Error al enviar')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[500px] relative">
      {newMessageAlert && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#3ecf8e] text-black px-4 py-2 rounded-full text-xs font-bold animate-bounce z-10">
          ¡Nuevo mensaje recibido!
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-white/40 text-sm mt-10">Aún no hay mensajes. ¡Escribe el primero!</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.sender_id === currentUserId 
                ? 'bg-[#3ecf8e] text-black rounded-tr-none' 
                : 'bg-white/10 text-white rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-4 border-t border-[var(--border)] flex gap-2">
        <input 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3ecf8e]"
        />
        <button 
          type="submit" 
          disabled={sending}
          className="bg-[#3ecf8e] text-black px-4 rounded-xl hover:bg-[#d4af37] disabled:opacity-50 transition-colors"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  )
}