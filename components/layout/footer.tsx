import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-5 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">
            Kwai<span className="text-gold-gradient">Spress</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-[var(--muted-foreground)]">
            Productos de vendedores de confianza. Pregunta, negocia y compra
            hablando directamente con ellos.
          </p>
        </div>

        <nav aria-label="Tienda" className="text-sm">
          <p className="mb-3 font-semibold">Tienda</p>
          <ul className="space-y-2 text-[var(--muted-foreground)]">
            <li><Link href="/" className="hover:text-[#ffd700]">Inicio</Link></li>
            <li><Link href="/productos" className="hover:text-[#ffd700]">Todos los productos</Link></li>
            <li><Link href="/categorias" className="hover:text-[#ffd700]">Categorías</Link></li>
          </ul>
        </nav>

        <nav aria-label="Cuenta" className="text-sm">
          <p className="mb-3 font-semibold">Vendedores</p>
          <ul className="space-y-2 text-[var(--muted-foreground)]">
            <li><Link href="/vender" className="hover:text-[#ffd700]">Abrir mi tienda</Link></li>
            <li><Link href="/login" className="hover:text-[#ffd700]">Iniciar sesión</Link></li>
            <li><Link href="/chat" className="hover:text-[#ffd700]">Mis chats</Link></li>
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-10 max-w-7xl border-t border-[var(--border)] pt-6 text-xs text-[var(--muted-foreground)]">
        © 2026 KwaiSpress. Todos los derechos reservados.
      </p>
    </footer>
  )
}