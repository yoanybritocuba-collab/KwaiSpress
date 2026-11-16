import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-6 text-center text-[var(--foreground)]">
      <div>
        <p className="font-display text-6xl font-bold text-[#ffd700]">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">Página no encontrada</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          El enlace no existe o el contenido ya no está disponible.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-[#ffd700] px-5 py-2.5 text-sm font-bold text-black">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
