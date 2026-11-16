'use client'

import { useState } from 'react'
import { MessageCircle, Loader2, X } from 'lucide-react'
import { iniciarChatInvitado } from '@/app/actions/mensajes'

export function StartChatButton({ productId, sellerId }: { productId: string, sellerId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Por favor, escribe tu nombre y tu correo.')
      return
    }

    setLoading(true)
    setError('')

    const res = await iniciarChatInvitado(productId, sellerId, name.trim(), email.trim())

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else if (res?.chatId) {
      window.location.href = `/chat?id=${res.chatId}`
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3ecf8e] px-4 py-3 text-sm font-bold text-black transition-all hover:bg-[#d4af37]">
        <MessageCircle size={15} />
        Enviar mensaje interno
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Contactar con el vendedor</h3>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            
            <p className="text-sm text-white/60 mb-4">Escribe tus datos para que el vendedor sepa quién eres. No necesitas crear una cuenta.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-white/80 mb-1">Tu nombre</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#3ecf8e] focus:outline-none" autoFocus />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-white/80 mb-1">Tu correo electrónico</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ej: juan@gmail.com" className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-[#3ecf8e] focus:outline-none" />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3ecf8e] px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-[#d4af37] disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Iniciar chat'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}