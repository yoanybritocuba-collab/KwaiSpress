'use client'

import { useRef, useState } from 'react'
import {
  Upload,
  X,
  Loader2,
  Star,
  GripVertical,
  ImagePlus,
} from 'lucide-react'

const MAX_FOTOS = 10
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export function UploadFotos({
  fotos,
  onChange,
}: {
  fotos: string[]
  onChange: (fotos: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const subirArchivos = async (files: FileList) => {
    setError('')

    if (fotos.length + files.length > MAX_FOTOS) {
      setError(`Máximo ${MAX_FOTOS} fotos`)
      return
    }

    setSubiendo(true)

    try {
      const nuevasUrls: string[] = []

      for (const file of Array.from(files)) {
        if (file.size > MAX_SIZE) {
          setError(`"${file.name}" supera los 5 MB`)
          continue
        }

        if (!file.type.startsWith('image/')) {
          setError(`"${file.name}" no es una imagen`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'admin')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Error subiendo archivo')
          continue
        }

        nuevasUrls.push(data.url)
      }

      onChange([...fotos, ...nuevasUrls])
    } catch {
      setError('Error al subir las imágenes')
    } finally {
      setSubiendo(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      subirArchivos(e.target.files)
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      subirArchivos(e.dataTransfer.files)
    }
  }

  const eliminarFoto = (url: string) => {
    onChange(fotos.filter((f) => f !== url))
  }

  const hacerPrincipal = (url: string) => {
    const sinUrl = fotos.filter((f) => f !== url)
    onChange([url, ...sinUrl])
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const nuevas = [...fotos]
    const [moved] = nuevas.splice(draggedIndex, 1)
    nuevas.splice(index, 0, moved)
    onChange(nuevas)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Zona de subida */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver
            ? 'border-[#ffd700] bg-[#ffd700]/[0.06]'
            : 'border-[var(--border)] bg-[var(--card)] hover:border-[#ffd700]/50 hover:bg-[#ffd700]/[0.03]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          disabled={subiendo}
          className="hidden"
        />

        {subiendo ? (
          <>
            <Loader2
              size={32}
              className="mx-auto animate-spin text-[#ffd700]"
            />
            <p className="mt-4 text-sm font-medium">Subiendo fotos...</p>
          </>
        ) : (
          <>
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#ffd700]/10 text-[#ffd700] transition-transform group-hover:scale-110">
              <ImagePlus size={26} />
            </span>
            <p className="mt-4 text-sm font-bold">
              Arrastra fotos aquí o pulsa para subir
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Máximo {MAX_FOTOS} fotos · 5 MB cada una · JPG, PNG, WEBP
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Contador */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--muted-foreground)]">
          {fotos.length} / {MAX_FOTOS} fotos
        </span>
        <span className="text-[#ffd700]">
          {fotos.length > 0
            ? '⭐ La primera es la principal'
            : 'Añade al menos 1 foto'}
        </span>
      </div>

      {/* Grid de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {fotos.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl border transition-all active:cursor-grabbing ${
                index === 0
                  ? 'border-[#ffd700] shadow-[0_0_16px_rgba(255,215,0,0.2)]'
                  : 'border-[var(--border)]'
              } ${draggedIndex === index ? 'opacity-40' : ''}`}
            >
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="size-full object-cover"
              />

              {/* Badge principal */}
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-[#ffd700] px-2 py-0.5 text-[9px] font-bold uppercase text-black">
                  <Star size={9} className="fill-black" />
                  Principal
                </span>
              )}

              {/* Ícono drag */}
              <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-md bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical size={12} />
              </span>

              {/* Botones al hover */}
              <div className="absolute inset-x-1.5 bottom-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => hacerPrincipal(url)}
                    className="flex-1 rounded-md bg-black/80 px-1.5 py-1 text-[9px] font-bold text-white backdrop-blur transition-colors hover:bg-[#ffd700] hover:text-black"
                    title="Hacer principal"
                  >
                    ⭐ Principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => eliminarFoto(url)}
                  className="grid size-7 shrink-0 place-items-center rounded-md bg-red-500/90 text-white transition-colors hover:bg-red-600"
                  title="Eliminar"
                >
                  <X size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}