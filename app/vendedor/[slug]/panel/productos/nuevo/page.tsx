'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Loader2,
  Check,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NuevoProductoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [sellerId, setSellerId] = useState('')
  const [categorias, setCategorias] = useState<any[]>([])

  // Datos del producto
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [precioAnterior, setPrecioAnterior] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [stock, setStock] = useState('')
  const [badge, setBadge] = useState('')

  // Fotos
  const [imagenes, setImagenes] = useState<string[]>([])
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }

      // Verificar que es vendedor aprobado
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('id, status')
        .eq('user_id', userData.user.id)
        .maybeSingle()

      if (!sellerData || sellerData.status !== 'approved') {
        router.push('/vender')
        return
      }

      setSellerId(sellerData.id)

      // Cargar categorías
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, parent_id')
        .eq('active', true)
        .order('order')

      setCategorias(cats || [])
      setLoading(false)
    }
    init()
  }, [router, supabase])

  // Subir imagen
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (imagenes.length + files.length > 10) {
      setError('Máximo 10 fotos por producto')
      return
    }

    setSubiendo(true)
    setError('')

    try {
      const nuevas: string[] = []

      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          setError(`"${file.name}" es mayor de 5 MB`)
          continue
        }

        const ext = file.name.split('.').pop()
        const fileName = `${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: upError } = await supabase.storage
          .from('products')
          .upload(fileName, file)

        if (upError) {
          setError(`Error subiendo: ${upError.message}`)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)

        nuevas.push(urlData.publicUrl)
      }

      setImagenes((prev) => [...prev, ...nuevas])
    } catch {
      setError('Error al subir imágenes')
    } finally {
      setSubiendo(false)
    }
  }

  const eliminarImagen = (url: string) => {
    setImagenes((prev) => prev.filter((i) => i !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (imagenes.length === 0) {
      setError('Sube al menos 1 foto')
      return
    }

    setSaving(true)

    const slug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const { error: insertError } = await supabase.from('products').insert({
      seller_id: sellerId,
      category_id: categoriaId || null,
      title: titulo.trim(),
      slug: `${slug}-${Date.now().toString().slice(-6)}`,
      description: descripcion.trim() || null,
      price: precio,
      old_price: precioAnterior || null,
      image_url: imagenes[0],
      images: imagenes,
      stock: stock ? Number(stock) : null,
      badge: badge.trim() || null,
      status: 'published',
      rating: '0',
      reviews_count: 0,
    })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/vendedor/panel/productos')
    }, 1500)
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--background)]">
        <Loader2 className="animate-spin text-[#ffd700]" size={28} />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)]/90 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Link
            href="/vendedor/panel/productos"
            className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700]"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd700]">
          Nuevo producto
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Publica tu producto
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Sube fotos, describe el producto y ponle un precio.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          {/* FOTOS */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="mb-1 font-semibold">Fotos del producto</h2>
            <p className="mb-5 text-xs text-[var(--muted-foreground)]">
              Sube hasta 10 fotos. La primera será la principal.
            </p>

            {/* Grid de fotos */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {imagenes.map((url, i) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border)]"
                >
                  <img
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="size-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-[#ffd700] px-2 py-0.5 text-[8px] font-bold uppercase text-black">
                      Principal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => eliminarImagen(url)}
                    className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                    aria-label="Eliminar"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {imagenes.length < 10 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] transition-colors hover:border-[#ffd700]/50 hover:bg-[#ffd700]/[0.03]">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    disabled={subiendo}
                    className="hidden"
                  />
                  {subiendo ? (
                    <Loader2 size={20} className="animate-spin text-[#ffd700]" />
                  ) : (
                    <>
                      <Upload size={20} className="text-[var(--muted-foreground)]" />
                      <span className="text-[10px] font-medium text-[var(--muted-foreground)]">
                        Añadir
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>

            <p className="mt-3 text-[11px] text-[var(--muted-foreground)]">
              {imagenes.length}/10 fotos · Máx 5 MB cada una
            </p>
          </div>

          {/* INFO */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="mb-5 font-semibold">Información del producto</h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Audífonos Bluetooth Pro"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffd700]/50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Precio (€) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="24.99"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffd700]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Precio anterior (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precioAnterior}
                    onChange={(e) => setPrecioAnterior(e.target.value)}
                    placeholder="39.99"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffd700]/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Categoría *
                </label>
                <select
                  required
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffd700]/50"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias
                    .filter((c) => !c.parent_id)
                    .map((cat) => (
                      <optgroup key={cat.id} label={cat.name}>
                        <option value={cat.id}>{cat.name} (todos)</option>
                        {categorias
                          .filter((c) => c.parent_id === cat.id)
                          .map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Descripción
                </label>
                <textarea
                  rows={5}
                  maxLength={1000}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe tu producto con detalle: materiales, características, envío..."
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffd700]/50"
                />
                <p className="mt-1 text-right text-[10px] text-[var(--muted-foreground)]">
                  {descripcion.length}/1000
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Stock (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Ej: 10"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffd700]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Etiqueta (opcional)
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ej: Nuevo, Oferta"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[#ffd700]/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ERRORES */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-[#3ecf8e]/20 bg-[#3ecf8e]/[0.06] px-4 py-3 text-sm text-[#3ecf8e]">
              <Check size={16} />
              ¡Producto publicado!
            </div>
          )}

          {/* BOTONES */}
          <div className="flex gap-3">
            <Link
              href="/vendedor/panel/productos"
              className="flex-1 rounded-xl border border-[var(--border)] px-6 py-3.5 text-center text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:border-[#ffd700] hover:text-[#ffd700]"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3ecf8e] px-6 py-3.5 text-sm font-semibold text-black transition-all hover:bg-[#ffd700] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Publicar producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}