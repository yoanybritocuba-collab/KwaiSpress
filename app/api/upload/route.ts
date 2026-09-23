import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    /* 1. Verificar que está logueado */
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión' },
        { status: 401 },
      )
    }

    /* 2. Leer el archivo */
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'general'

    if (!file) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
    }

    /* 3. Validar tipo y tamaño */
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Solo se permiten imágenes' },
        { status: 400 },
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Máximo 5 MB por imagen' },
        { status: 400 },
      )
    }

    /* 4. Generar nombre único */
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${folder}/${userData.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    /* 5. Subir a Supabase Storage */
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 },
      )
    }

    /* 6. Obtener URL pública */
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName,
    })
  } catch (err) {
    console.error('Error upload:', err)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 },
    )
  }
}