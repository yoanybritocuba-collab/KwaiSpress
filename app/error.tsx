'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-6 text-center text-[var(--foreground)]">
      <div>
        <p className="text-5xl">⚠️</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">Algo ha salido mal</h1>
        <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
          No hemos podido cargar esta página. Inténtalo de nuevo en unos segundos.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="rounded-full bg-[#ffd700] px-5 py-2.5 text-sm font-bold text-black">
            Reintentar
          </button>
          <Link href="/" className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
