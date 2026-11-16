import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActor } from '@/lib/auth/actor'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

/** Tipos permitidos. SVG queda fuera a propósito (puede contener scripts). */
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/** Comprueba los primeros bytes: no nos fiamos del Content-Type del cliente. */
function matchesMagic(type: string, b: Uint8Array): boolean {
  switch (type) {
    case 'image/jpeg':
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
    case 'image/png':
      return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
    case 'image/gif':
      return b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46
    case 'image/webp':
      return (
        b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
      )
    default:
      return false
  }
}

export async function POST(request: Request) {
  try {
    const actor = await getActor()
    if (!actor) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    // Solo administradores y vendedores aprobados pueden subir imágenes
    const canUpload = actor.admin || actor.seller?.status === 'approved'
    if (!canUpload) {
      return NextResponse.json(
        { error: 'Necesitas una tienda aprobada para subir imágenes' },
        { status: 403 },
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
    }

    const ext = TYPES[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'Formato no permitido. Usa JPG, PNG, WEBP o GIF' },
        { status: 400 },
      )
    }
    if (file.size === 0 || file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Máximo 5 MB por imagen' }, { status: 400 })
    }

    const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (!matchesMagic(file.type, head)) {
      return NextResponse.json({ error: 'El archivo no es una imagen válida' }, { status: 400 })
    }

    // La carpeta la decide el servidor, nunca el cliente
    const folder = actor.admin ? 'admin' : 'sellers'
    const fileName = `${folder}/${actor.user.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${ext}`

    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '31536000',
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'No se pudo subir la imagen' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName)

    return NextResponse.json({ url: urlData.publicUrl, path: fileName })
  } catch (err) {
    console.error('Error upload:', err)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
