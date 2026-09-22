'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  MessageCircle,
  Search,
  Send,
  SlidersHorizontal,
  Star,
  X,
  Zap,
} from 'lucide-react'

/* ============================================================
   TIPOS
   ============================================================ */

type Product = {
  id: string
  title: string
  seller: string
  price: number
  oldPrice?: number
  category: string
  rating: number
  reviews: number
  color: string
  glyph: string
  badge: string
}

type Category = {
  name: string
  icon: string
}

/* ============================================================
   DATOS DE PRUEBA
   ============================================================ */

const categories: Category[] = [
  { name: 'Tecnología', icon: '💻' },
  { name: 'Moda', icon: '👗' },
  { name: 'Hogar', icon: '🏠' },
  { name: 'Ofertas', icon: '🔥' },
]

const products: Product[] = [
  {
    id: 'p1',
    title: 'Audífonos inalámbricos Pro',
    seller: 'TechLab Store',
    price: 24.99,
    oldPrice: 39.99,
    category: 'Tecnología',
    rating: 4.9,
    reviews: 128,
    color: 'from-indigo-500 to-blue-700',
    glyph: '🎧',
    badge: '-38%',
  },
  {
    id: 'p2',
    title: 'Bolso mini acolchado',
    seller: 'Luna Boutique',
    price: 18.5,
    oldPrice: 29.9,
    category: 'Moda',
    rating: 4.8,
    reviews: 76,
    color: 'from-orange-400 to-pink-500',
    glyph: '👜',
    badge: '-35%',
  },
  {
    id: 'p3',
    title: 'Lámpara nube LED',
    seller: 'Casa Bonita',
    price: 16.0,
    oldPrice: 22.0,
    category: 'Hogar',
    rating: 4.7,
    reviews: 54,
    color: 'from-cyan-400 to-teal-600',
    glyph: '☁️',
    badge: 'Oferta',
  },
  {
    id: 'p4',
    title: 'Smartwatch Active S2',
    seller: 'Gadget City',
    price: 32.0,
    oldPrice: 49.0,
    category: 'Tecnología',
    rating: 4.9,
    reviews: 212,
    color: 'from-slate-600 to-slate-900',
    glyph: '⌚',
    badge: '-34%',
  },
  {
    id: 'p5',
    title: 'Set de vasos de color',
    seller: 'Hogar & Más',
    price: 12.75,
    oldPrice: 18.5,
    category: 'Hogar',
    rating: 4.6,
    reviews: 42,
    color: 'from-yellow-300 to-orange-500',
    glyph: '🥃',
    badge: 'Nuevo',
  },
  {
    id: 'p6',
    title: 'Sudadera Essential',
    seller: 'Urban Mood',
    price: 21.9,
    oldPrice: 34.9,
    category: 'Moda',
    rating: 4.8,
    reviews: 91,
    color: 'from-violet-500 to-fuchsia-600',
    glyph: '👕',
    badge: '-37%',
  },
]

/* ============================================================
   COMPONENTES INTERNOS
   ============================================================ */

function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5"
      aria-label="KwaiSpress"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-white text-black transition-colors group-hover:bg-[#d4af37]">
        <Zap size={18} strokeWidth={2.5} />
      </span>
      <span className="text-lg font-black tracking-tight">
        <span className="text-white">Kwai</span>
        <span className="text-[#10b77f] transition-colors group-hover:text-[#d4af37]">
          Spress
        </span>
      </span>
    </Link>
  )
}

function ProductCard({
  product,
  onAsk,
}: {
  product: Product
  onAsk: (product: Product) => void
}) {
  const [liked, setLiked] = useState(false)

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0a] transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37]/40 hover:bg-[#0f0f0f]">
      <div
        className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${product.color}`}
      >
        <span className="select-none text-[72px] font-black text-white/80 drop-shadow-lg transition-transform duration-500 group-hover:scale-105">
          {product.glyph}
        </span>

        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {product.badge}
        </span>

        <button
          onClick={() => setLiked(!liked)}
          aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 text-slate-800 opacity-0 transition-all group-hover:opacity-100 hover:bg-[#d4af37] hover:text-black"
        >
          <Heart
            className={liked ? 'fill-rose-500 text-rose-500' : ''}
            size={16}
          />
        </button>
      </div>

      <div className="p-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
          {product.category}
        </p>
        <h3 className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-[#d4af37]">
          {product.title}
        </h3>
        <p className="mt-1 truncate text-xs text-white/40">{product.seller}</p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span className="text-[11px] text-white/30 line-through">
                ${product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-white/60">
            <Star size={11} className="fill-[#d4af37] text-[#d4af37]" />
            {product.rating}
          </span>
        </div>

        <button
          onClick={() => onAsk(product)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
        >
          <MessageCircle size={14} /> Preguntar al vendedor
        </button>
      </div>
    </article>
  )
}

function ChatModal({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const send = () => {
    if (!message.trim()) return
    setSent(true)
    setMessage('')
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Chat con vendedor"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#10b77f]">
              Chat del producto
            </p>
            <h2 className="mt-1 text-base font-bold text-white">
              {product.title}
            </h2>
            <p className="mt-0.5 text-xs text-white/45">
              Vendedor: {product.seller}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/5 hover:text-[#d4af37]"
            aria-label="Cerrar chat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="min-h-24 rounded-xl border border-white/[0.06] bg-black p-4 text-sm text-white/50">
            {sent
              ? '✓ Mensaje enviado. El vendedor podrá responderte desde su bandeja.'
              : 'Escribe una pregunta para iniciar la conversación.'}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="¿Tienes alguna pregunta sobre este producto?"
            rows={3}
            className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-black p-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#d4af37]"
          />

          <button
            onClick={send}
            disabled={!message.trim()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#d4af37] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Send size={15} /> Enviar mensaje
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   PÁGINA PRINCIPAL
   ============================================================ */

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatProduct, setChatProduct] = useState<Product | null>(null)

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (activeCategory === 'Todos' || p.category === activeCategory) &&
          p.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [activeCategory, query],
  )

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Barra superior */}
      <div className="border-b border-white/[0.06] bg-black px-4 py-2.5 text-center text-[11px] font-medium tracking-wide text-white/50">
        <span className="text-[#10b77f]">●</span> Envío seguro · Vendedores
        verificados · <span className="text-[#d4af37]">Ofertas cada día</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 lg:px-8">
          <button
            className="text-white/60 transition-colors hover:text-[#d4af37] lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Logo />

          <nav className="ml-6 hidden items-center gap-7 text-sm font-medium lg:flex">
            <a
              href="#inicio"
              className="text-white transition-colors hover:text-[#d4af37]"
            >
              Inicio
            </a>
            <a
              href="#ofertas"
              className="text-white/60 transition-colors hover:text-[#d4af37]"
            >
              Ofertas
            </a>
            <a
              href="#categorias"
              className="text-white/60 transition-colors hover:text-[#d4af37]"
            >
              Categorías
            </a>
            <Link
              href="/admin"
              className="text-white/60 transition-colors hover:text-[#d4af37]"
            >
              Admin
            </Link>
          </nav>

          <div className="relative ml-auto hidden max-w-md flex-1 md:block">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              size={16}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos, vendedores..."
              className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0a] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#d4af37]/50"
            />
          </div>

          <button
            className="relative rounded-xl p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-[#d4af37]"
            aria-label="Mensajes"
          >
            <MessageCircle size={20} />
            <span className="absolute right-0.5 top-0.5 size-2 rounded-full bg-[#10b77f]" />
          </button>

          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:text-[#d4af37] sm:block"
          >
            Entrar
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#d4af37]"
          >
            Registrarme
          </Link>
        </div>

        {menuOpen && (
          <div className="border-t border-white/[0.06] px-4 py-4 lg:hidden">
            <div className="relative mb-4">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                size={16}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full rounded-xl border border-white/[0.08] bg-[#0a0a0a] py-2.5 pl-10 pr-4 text-sm text-white outline-none"
              />
            </div>
            <div className="flex flex-col gap-3 text-sm font-medium">
              <a href="#inicio" className="text-white/70 hover:text-[#d4af37]">
                Inicio
              </a>
              <a href="#ofertas" className="text-white/70 hover:text-[#d4af37]">
                Ofertas
              </a>
              <a href="#categorias" className="text-white/70 hover:text-[#d4af37]">
                Categorías
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="inicio" className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0a0a0a] px-8 py-14 sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-[#10b77f]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-[#d4af37]/[0.06] blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white/60 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#10b77f]" />
              Marketplace verificado
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Descubre productos.
              <br />
              <span className="text-white/40">Habla con el vendedor.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/55">
              Explora productos de vendedores autorizados y conversa directamente
              antes de comprar. Sin intermediarios.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#ofertas"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#d4af37]"
              >
                Explorar productos <ArrowRight size={16} />
              </a>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                Vender aquí
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-white/40">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#10b77f]" />
                <span>+2.500 vendedores activos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#d4af37]" />
                <span>Envío a todo el país</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section id="categorias" className="mx-auto max-w-7xl px-4 pt-14 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
              Explora
            </p>
            <h2 className="mt-1 text-2xl font-bold">Por categoría</h2>
          </div>
          <a
            href="#ofertas"
            className="hidden items-center gap-1 text-sm font-medium text-white/50 transition-colors hover:text-[#d4af37] sm:flex"
          >
            Ver todas <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
                activeCategory === category.name
                  ? 'border-[#d4af37]/50 bg-[#0f0f0f]'
                  : 'border-white/[0.06] bg-[#0a0a0a] hover:border-[#d4af37]/30 hover:bg-[#0f0f0f]'
              }`}
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="text-sm font-medium text-white">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Ofertas */}
      <section
        id="ofertas"
        className="mx-auto max-w-7xl px-4 pb-20 pt-14 lg:px-8"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
              Destacados
            </p>
            <h2 className="mt-1 text-2xl font-bold">Ofertas del día</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCategory('Todos')}
              className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors ${
                activeCategory === 'Todos'
                  ? 'border-[#d4af37]/50 bg-[#0f0f0f] text-[#d4af37]'
                  : 'border-white/[0.08] bg-transparent text-white/60 hover:border-[#d4af37]/30 hover:text-[#d4af37]'
              }`}
            >
              Todos
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3.5 py-2 text-xs font-medium text-white/60 transition-colors hover:border-[#d4af37]/30 hover:text-[#d4af37]">
              <SlidersHorizontal size={14} /> Filtrar
              <ChevronDown size={13} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAsk={setChatProduct}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-white/40">
              No encontramos productos con esa búsqueda.
            </p>
          </div>
        )}
      </section>

      {/* Modal chat */}
      {chatProduct && (
        <ChatModal
          product={chatProduct}
          onClose={() => setChatProduct(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <Logo />
            <p className="mt-3 text-xs text-white/40">
              Compra, pregunta, negocia. Tú decides cómo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-white/50">
            <a href="#inicio" className="transition-colors hover:text-[#d4af37]">
              Sobre KwaiSpress
            </a>
            <a
              href="#categorias"
              className="transition-colors hover:text-[#d4af37]"
            >
              Ayuda
            </a>
            <a href="#inicio" className="transition-colors hover:text-[#d4af37]">
              Contacto
            </a>
            <Link
              href="/admin"
              className="transition-colors hover:text-[#d4af37]"
            >
              Administrar
            </Link>
          </div>

          <p className="text-xs text-white/30">© 2026 KwaiSpress</p>
        </div>
      </footer>
    </main>
  )
}