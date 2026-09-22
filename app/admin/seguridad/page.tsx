'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Lock,
  Mail,
  LogOut,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Smartphone,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Tab = 'password' | 'email' | 'sessions'

export default function SeguridadPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('password')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [lastSignIn, setLastSignIn] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || '')
        setUserName(
          (data.user.user_metadata?.name as string) ||
            data.user.email?.split('@')[0] ||
            'Admin',
        )
        setLastSignIn(data.user.last_sign_in_at || '')
      }
      setLoading(false)
    })
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="grid place-items-center py-32">
        <Loader2 className="animate-spin text-[#ffd700]" size={28} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffd700]">
          Configuración
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Seguridad de la cuenta
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Protege tu acceso al panel de administración.
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#ffd700]/20 bg-[#ffd700]/[0.03] p-4">
        <Shield size={20} className="mt-0.5 shrink-0 text-[#ffd700]" />
        <div>
          <p className="text-sm font-semibold text-[#ffd700]">
            Cuenta de máxima seguridad
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Esta cuenta controla toda la plataforma. Nunca compartas tu
            contraseña con nadie.
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1">
        <button
          onClick={() => setTab('password')}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'password'
              ? 'bg-white text-black'
              : 'text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-[#ffd700]'
          }`}
        >
          <Lock size={15} />
          Contraseña
        </button>
        <button
          onClick={() => setTab('email')}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'email'
              ? 'bg-white text-black'
              : 'text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-[#ffd700]'
          }`}
        >
          <Mail size={15} />
          Email
        </button>
        <button
          onClick={() => setTab('sessions')}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'sessions'
              ? 'bg-white text-black'
              : 'text-[var(--muted-foreground)] hover:bg-white/[0.04] hover:text-[#ffd700]'
          }`}
        >
          <Smartphone size={15} />
          Sesiones
        </button>
      </div>

      {tab === 'password' && <PasswordTab />}
      {tab === 'email' && <EmailTab currentEmail={userEmail} />}
      {tab === 'sessions' && (
        <SessionsTab
          userEmail={userEmail}
          userName={userName}
          lastSignIn={lastSignIn}
        />
      )}
    </div>
  )
}

/* ============================================================
   PESTAÑA: CAMBIAR CONTRASEÑA
   ============================================================ */

function PasswordTab() {
  const supabase = createClient()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const getPasswordStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return Math.min(score, 5)
  }

  const strength = getPasswordStrength(newPassword)
  const strengthLabels = [
    'Muy débil',
    'Débil',
    'Normal',
    'Buena',
    'Fuerte',
    'Excelente',
  ]
  const strengthColors = [
    'bg-red-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-yellow-500',
    'bg-[#3ecf8e]',
    'bg-[#3ecf8e]',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
    setTimeout(() => setSuccess(false), 5000)
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold">Cambiar contraseña</h2>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        Introduce tu contraseña actual y elige una nueva.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Contraseña actual
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Tu contraseña actual"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-12 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700]"
              aria-label={showCurrent ? 'Ocultar' : 'Mostrar'}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              type={showNew ? 'text' : 'password'}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-12 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700]"
              aria-label={showNew ? 'Ocultar' : 'Mostrar'}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {newPassword.length > 0 && (
            <div className="mt-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i <= strength
                        ? strengthColors[strength]
                        : 'bg-[var(--border)]'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-[var(--muted-foreground)]">
                Seguridad: {strengthLabels[strength]}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Confirmar nueva contraseña
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              type={showNew ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la nueva contraseña"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-12 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-400">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-[#3ecf8e]/20 bg-[#3ecf8e]/[0.06] px-4 py-3 text-xs text-[#3ecf8e]">
            <Check size={14} />
            Contraseña cambiada correctamente
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading || !currentPassword || !newPassword || !confirmPassword
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd700] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#ffd700]/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Cambiando...
            </>
          ) : (
            <>
              <Lock size={15} />
              Cambiar contraseña
            </>
          )}
        </button>
      </form>
    </div>
  )
}

/* ============================================================
   PESTAÑA: CAMBIAR EMAIL
   ============================================================ */

function EmailTab({ currentEmail }: { currentEmail: string }) {
  const supabase = createClient()
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ email: newEmail })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setNewEmail('')
    setLoading(false)
    setTimeout(() => setSuccess(false), 8000)
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold">Cambiar email</h2>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        Tu email actual es <strong>{currentEmail}</strong>
      </p>

      <div className="mt-6 rounded-xl border border-[#ffd700]/20 bg-[#ffd700]/[0.03] p-4">
        <p className="text-xs text-[var(--muted-foreground)]">
          <strong className="text-[#ffd700]">Importante:</strong> al cambiar tu
          email, Supabase enviará un enlace de confirmación. Debes hacer clic en
          ese enlace para que el cambio se aplique.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Nuevo email
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nuevo@email.com"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-400">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-[#3ecf8e]/20 bg-[#3ecf8e]/[0.06] px-4 py-3 text-xs text-[#3ecf8e]">
            <Check size={14} />
            Enlace de confirmación enviado. Revisa tu correo.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !newEmail}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd700] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#ffd700]/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Mail size={15} />
              Enviar enlace de confirmación
            </>
          )}
        </button>
      </form>
    </div>
  )
}

/* ============================================================
   PESTAÑA: SESIONES
   ============================================================ */

function SessionsTab({
  userEmail,
  userName,
  lastSignIn,
}: {
  userEmail: string
  userName: string
  lastSignIn: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleLogoutAll = async () => {
    if (!confirm('¿Cerrar sesión en TODOS los dispositivos?')) return
    setLoading(true)
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/login')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-display text-xl font-semibold">Último acceso</h2>
        <div className="mt-4 flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-xl bg-[#ffd700]/10 text-[#ffd700]">
            <Clock size={20} />
          </span>
          <div>
            <p className="text-sm font-medium">
              {lastSignIn
                ? new Date(lastSignIn).toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'No disponible'}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {userName} · {userEmail}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-display text-xl font-semibold">
          Cerrar todas las sesiones
        </h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Si crees que alguien ha accedido a tu cuenta, cierra la sesión en
          todos los dispositivos.
        </p>

        <button
          onClick={handleLogoutAll}
          disabled={loading}
          className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.06] px-5 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/[0.12] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Cerrando...
            </>
          ) : (
            <>
              <LogOut size={15} />
              Cerrar sesión en todos los dispositivos
            </>
          )}
        </button>
      </div>
    </div>
  )
}