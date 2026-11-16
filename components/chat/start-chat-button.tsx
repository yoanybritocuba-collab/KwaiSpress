'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Loader2, X, Lock } from 'lucide-react'
import { iniciarChatInvitado } from '@/app/actions/mensajes'

const KEY = 'kwaispress-guest'

export function StartChatButton({ productId, sellerId }: { productId: string; sellerId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Recuerda tus datos para no escribirlos otra vez
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
      if (saved?.name) setName(saved.name)
      if (saved?.email) setEmail(saved.email)
    } catch {
      /* almacenamiento no disponible */
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Escribe tu nombre y tu correo.')
      return
    }
    setLoading(true)
    setError('')

    const res = await iniciarChatInvitado(productId, sellerId, name.trim(), email.trim())

    if (res?.error) {
      setError(res.error)
      setLoading(false)
      return
    }
    if (res?.chatId) {
      try {
        localStorage.setItem(KEY, JSON.stringify({ name: name.trim(), email: email.trim() }))
      } catch {
        /* ignorar */
      }
      window.location.assign(`/chat?id=${res.chatId}`)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3ecf8e] px-4 py-3 text-sm font-bold text-black hover:bg-[#ffd700]"
      >
        <MessageCircle size={16} />
        Hablar con el vendedor
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Contactar con el vendedor"
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-up w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 text-white shadow-2xl"
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-sans text-lg font-bold">Contactar con el vendedor</h3>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <p className="mb-5 text-sm text-white/60">
              Sin crear cuenta. El vendedor recibirá tu mensaje al instante.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="chat-name" className="mb-1 block text-xs font-medium text-white/80">Tu nombre</label>
                <input
                  id="chat-name"
                  type="text"
                  autoComplete="name"
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#3ecf8e]"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="chat-email" className="mb-1 block text-xs font-medium text-white/80">Tu correo electrónico</label>
                <input
                  id="chat-email"
                  type="email"
                  autoComplete="email"
                  maxLength={120}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[#3ecf8e]"
                />
              </div>

              {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3ecf8e] px-4 py-3 text-sm font-bold text-black hover:bg-[#ffd700] disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Iniciar chat'}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
                <Lock size={11} /> Chat privado: solo tú y el vendedor lo veis.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  )
}