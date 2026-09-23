'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  ImagePlus,
  Info,
  DollarSign,
  Tag,
  Eye,
  Package,
  Save,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UploadFotos } from '@/components/admin/upload-fotos'
import { CategoryPicker } from '@/components/admin/category-picker'

type SubCategory = {
  id: string
  name: string
  slug: string
  icon: string | null
  parentId: string | null
}

type Category = SubCategory & {
  subcategories?: SubCategory[]
}

type Paso = 1 | 2 | 3 | 4 | 5

export default function NuevoProductoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [paso, setPaso] = useState<Paso>(1)

  const [sellerId, setSellerId] = useState('')
  const [categorias, setCategorias] = useState<Category[]>([])

  /* Formulario */
  const [fotos, setFotos] = useState<string[]>([])
  const [titulo, setTitulo] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [precioAnterior, setPrecioAnterior] = useState('')
  const [stock, setStock] = useState('')
  const [marca, setMarca] = useState('')
  const [material, setMaterial] = useState('')
  const [estado, setEstado] = useState('nuevo')

  /* Cargar datos */
  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }

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

      /* Categorías */
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug, icon, parent_id')
        .eq('active', true)
        .order('order')

      const todas = (cats || []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        parentId: c.parent_id,
      }))

      const principales = todas.filter((c) => !c.parentId)
      const conSubs = principales.map((p) => ({
        ...p,
        subcategories: todas.filter((s) => s.parentId === p.id),
      }))

      setCategorias(conSubs)
      setCargando(false)
    }
    init()
  }, [router, supabase])

  /* Validar paso */
  const puedeAvanzar = () => {
    if (paso === 1) return fotos.length > 0
    if (paso === 2) return titulo.trim().length > 0 && categoriaId !== ''
    if (paso === 3) return precio !== '' && Number(precio) > 0
    return true
  }

  const siguiente = () => {
    setError('')
    if (!puedeAvanzar()) {
      if (paso === 1) setError('Añade al menos 1 foto')
      if (paso === 2) setError('Título y categoría son obligatorios')
      if (paso === 3) setError('El precio es obligatorio')
      return
    }
    if (paso < 5) setPaso((paso + 1) as Paso)
  }

  const atras = () => {
    setError('')
    if (paso > 1) setPaso((paso - 1) as Paso)
  }

  /* Generar slug */
  const generarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /* Publicar */
  const publicar = async () => {
    setError('')
    setGuardando(true)

    try {
      const slug = `${generarSlug(titulo)}-${Date.now().toString().slice(-6)}`

      /* Crear producto */
      const { data: producto, error: errorProducto } = await supabase
        .from('products')
        .insert({
          seller_id: sellerId,
          category_id: categoriaId,
          title: titulo.trim(),
          slug,
          description: descripcion.trim() || null,
          price: precio,
          old_price: precioAnterior || null,
          image_url: fotos[0],
          images: fotos,
          stock: stock ? Number(stock) : null,
          brand: marca.trim() || null,
          material: material.trim() || null,
          condition: estado,
          status: 'published',
          rating: '0',
          reviews_count: 0,
        })
        .select('id')
        .single()

      if (errorProducto) {
        setError(errorProducto.message)
        setGuardando(false)
        return
      }

      /* Crear oferta */
      await supabase.from('product_offers').insert({
        product_id: producto.id,
        seller_id: sellerId,
        price: precio,
        old_price: precioAnterior || null,
        stock: stock ? Number(stock) : null,
        active: true,
        approved: true,
      })

      router.push('/admin/mi-tienda/productos')
    } catch (err) {
      console.error(err)
      setError('Error al publicar el producto')
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="animate-spin text-[#ffd700]" size={28} />
      </div>
    )
  }

  /* Pasos */
  const pasos = [
    { num: 1, label: 'Fotos', icon: ImagePlus },
    { num: 2, label: 'Información', icon: Info },
    { num: 3, label: 'Precio', icon: DollarSign },
    { num: 4, label: 'Detalles', icon: Tag },
    { num: 5, label: 'Revisar', icon: Eye },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      {/* Cabecera */}
      <div className="mb-8">
        <Link
          href="/admin/mi-tienda"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[#ffd700]"
        >
          <ArrowLeft size={14} />
          Volver a mi tienda
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd700]">
          Nuevo producto
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Publica un producto
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Rellena los datos en 5 pasos y publícalo en tu tienda.
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-1">
          {pasos.map((p, i) => {
            const activo = paso === p.num
            const completado = paso > p.num
            const Icon = p.icon

            return (
              <div key={p.num} className="flex flex-1 items-center gap-1">
                <button
                  type="button"
                  onClick={() => paso > p.num && setPaso(p.num as Paso)}
                  disabled={paso < p.num}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 transition-all ${
                    activo
                      ? 'bg-[#ffd700]/10'
                      : completado
                        ? 'cursor-pointer hover:bg-[var(--card)]'
                        : 'cursor-not-allowed opacity-40'
                  }`}
                >
                  <span
                    className={`grid size-8 place-items-center rounded-full text-xs font-bold transition-colors ${
                      activo
                        ? 'bg-[#ffd700] text-black'
                        : completado
                          ? 'bg-[#3ecf8e] text-black'
                          : 'bg-[var(--card)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {completado ? <Check size={14} strokeWidth={3} /> : p.num}
                  </span>
                  <span
                    className={`hidden text-[10px] font-bold uppercase tracking-wider sm:block ${
                      activo
                        ? 'text-[#ffd700]'
                        : completado
                          ? 'text-[#3ecf8e]'
                          : 'text-[var(--muted-foreground)]'
                    }`}
                  >
                    {p.label}
                  </span>
                </button>
                {i < pasos.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 rounded-full ${
                      paso > p.num ? 'bg-[#3ecf8e]' : 'bg-[var(--border)]'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        {paso === 1 && (
          <div>
            <h2 className="mb-1 font-display text-xl font-semibold">
              Fotos del producto
            </h2>
            <p className="mb-6 text-xs text-[var(--muted-foreground)]">
              Sube hasta 10 fotos. La primera será la principal.
            </p>
            <UploadFotos fotos={fotos} onChange={setFotos} />
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="mb-1 font-display text-xl font-semibold">
                Información básica
              </h2>
              <p className="mb-6 text-xs text-[var(--muted-foreground)]">
                Nombre, categoría y descripción del producto.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Título del producto *
              </label>
              <input
                type="text"
                maxLength={100}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Audífonos Bluetooth Pro"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
              />
              <p className="mt-1 text-right text-[10px] text-[var(--muted-foreground)]">
                {titulo.length}/100
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Categoría *
              </label>
              <CategoryPicker
                categorias={categorias}
                categoriaId={categoriaId}
                onChange={setCategoriaId}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Descripción
              </label>
              <textarea
                rows={5}
                maxLength={1000}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe tu producto: materiales, características, medidas, etc."
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
              />
              <p className="mt-1 text-right text-[10px] text-[var(--muted-foreground)]">
                {descripcion.length}/1000
              </p>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="mb-1 font-display text-xl font-semibold">
                Precio y stock
              </h2>
              <p className="mb-6 text-xs text-[var(--muted-foreground)]">
                Cuánto cuesta y cuántas unidades tienes.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Precio de venta (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="24.99"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Precio anterior (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioAnterior}
                  onChange={(e) => setPrecioAnterior(e.target.value)}
                  placeholder="39.99"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
                />
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                  Se mostrará tachado. Aparecerá badge &quot;Oferta&quot;
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Stock disponible
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Ej: 10"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
              />
              <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                Déjalo vacío si no quieres controlar stock
              </p>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="mb-1 font-display text-xl font-semibold">
                Detalles del producto
              </h2>
              <p className="mb-6 text-xs text-[var(--muted-foreground)]">
                Información adicional para mejorar tu anuncio.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Marca
                </label>
                <input
                  type="text"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ej: Samsung"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Ej: Algodón"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[#ffd700]/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Estado del producto
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'nuevo', label: 'Nuevo' },
                  { value: 'como-nuevo', label: 'Como nuevo' },
                  { value: 'usado', label: 'Usado' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEstado(opt.value)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      estado === opt.value
                        ? 'border-[#ffd700]/50 bg-[#ffd700]/[0.08] text-[#ffd700]'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[#ffd700]/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {paso === 5 && (
          <div>
            <h2 className="mb-1 font-display text-xl font-semibold">
              Revisar y publicar
            </h2>
            <p className="mb-6 text-xs text-[var(--muted-foreground)]">
              Comprueba que todo está correcto antes de publicar.
            </p>

            {/* Vista previa */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex gap-4">
                <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-[var(--card)]">
                  {fotos[0] ? (
                    <img
                      src={fotos[0]}
                      alt="Producto"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-2xl">
                      📦
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#ffd700]">
                    {categorias.find((c) => c.id === categoriaId)?.name ||
                      categorias
                        .flatMap((c) => c.subcategories || [])
                        .find((s) => s.id === categoriaId)?.name ||
                      'Sin categoría'}
                  </p>
                  <h3 className="mt-1 font-bold">{titulo || 'Sin título'}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-lg font-bold">
                      {precio ? `${Number(precio).toFixed(2)} €` : '0,00 €'}
                    </span>
                    {precioAnterior && (
                      <span className="text-xs text-[var(--muted-foreground)] line-through">
                        {Number(precioAnterior).toFixed(2)} €
                      </span>
                    )}
                  </div>
                  {stock && (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Stock: {stock}
                    </p>
                  )}
                </div>
              </div>

              {descripcion && (
                <p className="mt-4 line-clamp-2 text-xs text-[var(--muted-foreground)]">
                  {descripcion}
                </p>
              )}

              {fotos.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {fotos.slice(1).map((url, i) => (
                    <div
                      key={url}
                      className="size-14 shrink-0 overflow-hidden rounded-lg bg-[var(--card)]"
                    >
                      <img
                        src={url}
                        alt={`Foto ${i + 2}`}
                        className="size-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#3ecf8e]/20 bg-[#3ecf8e]/[0.03] p-4">
              <Package size={18} className="mt-0.5 shrink-0 text-[#3ecf8e]" />
              <div>
                <p className="text-sm font-semibold text-[#3ecf8e]">
                  Se publicará inmediatamente
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Aparecerá en la web pública y podrás editarlo cuando quieras.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={atras}
          disabled={paso === 1}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-medium transition-colors hover:border-[#ffd700]/40 hover:text-[#ffd700] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={15} />
          Atrás
        </button>

        {paso < 5 ? (
          <button
            type="button"
            onClick={siguiente}
            className="flex items-center gap-2 rounded-xl bg-[#ffd700] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#ffd700]/90"
          >
            Siguiente
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={publicar}
            disabled={guardando}
            className="flex items-center gap-2 rounded-xl bg-[#3ecf8e] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#ffd700] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Save size={15} />
                Publicar producto
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}