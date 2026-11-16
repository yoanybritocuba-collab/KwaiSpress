'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react'
import { actualizarProducto } from '@/app/actions/productos'
import { UploadFotos } from '@/components/admin/upload-fotos'
import { CategoryPicker } from '@/components/admin/category-picker'

type Cat = {
  id: string
  name: string
  slug: string
  icon: string | null
  parentId: string | null
  subcategories?: Cat[]
}

export type ProductoEditable = {
  id: string
  title: string
  description: string
  price: string
  oldPrice: string
  stock: string
  brand: string
  material: string
  condition: string
  categoryId: string
  images: string[]
}

const field =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[#ffd700]'

export function EditarProductoForm({
  producto,
  categorias,
  volverHref,
}: {
  producto: ProductoEditable
  categorias: Cat[]
  volverHref: string
}) {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const [titulo, setTitulo] = useState(producto.title)
  const [descripcion, setDescripcion] = useState(producto.description)
  const [precio, setPrecio] = useState(producto.price)
  const [precioAnterior, setPrecioAnterior] = useState(producto.oldPrice)
  const [stock, setStock] = useState(producto.stock)
  const [marca, setMarca] = useState(producto.brand)
  const [material, setMaterial] = useState(producto.material)
  const [estado, setEstado] = useState(producto.condition)
  const [categoriaId, setCategoriaId] = useState(producto.categoryId)
  const [fotos, setFotos] = useState<string[]>(producto.images)

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (fotos.length === 0) {
      setError('El producto necesita al menos 1 foto')
      return
    }
    setGuardando(true)
    const res = await actualizarProducto(producto.id, {
      titulo,
      descripcion,
      precio,
      precioAnterior,
      stock,
      marca,
      material,
      estado,
      categoriaId: categoriaId || null,
      fotos,
    })
    if (!res.ok) {
      setError(res.error)
      setGuardando(false)
      return
    }
    router.push(volverHref)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <Link
        href={volverHref}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[#ffd700]"
      >
        <ArrowLeft size={16} /> Volver
      </Link>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold">Editar producto</h1>

        <form onSubmit={guardar} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-bold">Fotos</label>
            <UploadFotos fotos={fotos} onChange={setFotos} />
          </div>

          <div>
            <label htmlFor="titulo" className="mb-2 block text-sm font-bold">Título</label>
            <input id="titulo" className={field} value={titulo} onChange={(e) => setTitulo(e.target.value)} required minLength={3} maxLength={150} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Categoría</label>
            <CategoryPicker categorias={categorias} categoriaId={categoriaId} onChange={setCategoriaId} />
          </div>

          <div>
            <label htmlFor="desc" className="mb-2 block text-sm font-bold">Descripción</label>
            <textarea id="desc" className={`${field} h-32 resize-none`} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={5000} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="precio" className="mb-2 block text-sm font-bold">Precio (€)</label>
              <input id="precio" type="number" step="0.01" min="0.01" className={field} value={precio} onChange={(e) => setPrecio(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="antes" className="mb-2 block text-sm font-bold">Precio anterior (opcional)</label>
              <input id="antes" type="number" step="0.01" min="0" className={field} value={precioAnterior} onChange={(e) => setPrecioAnterior(e.target.value)} />
            </div>
            <div>
              <label htmlFor="stock" className="mb-2 block text-sm font-bold">Stock</label>
              <input id="stock" type="number" min="0" step="1" className={field} value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <div>
              <label htmlFor="estado" className="mb-2 block text-sm font-bold">Estado</label>
              <select id="estado" className={field} value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="nuevo">Nuevo</option>
                <option value="como-nuevo">Como nuevo</option>
                <option value="usado">Usado</option>
              </select>
            </div>
            <div>
              <label htmlFor="marca" className="mb-2 block text-sm font-bold">Marca</label>
              <input id="marca" className={field} value={marca} onChange={(e) => setMarca(e.target.value)} maxLength={80} />
            </div>
            <div>
              <label htmlFor="material" className="mb-2 block text-sm font-bold">Material</label>
              <input id="material" className={field} value={material} onChange={(e) => setMaterial(e.target.value)} maxLength={80} />
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <button type="submit" disabled={guardando} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd700] py-4 font-bold text-black hover:bg-[#ffd700]/90 disabled:opacity-50">
            {guardando ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
