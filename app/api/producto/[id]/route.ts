import { NextResponse } from 'next/server'
import { getPublicProduct } from '@/lib/db/queries'
import { isUuid } from '@/lib/utils'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!isUuid(id)) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  const resultado = await getPublicProduct(id)
  if (!resultado) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  return NextResponse.json(resultado)
}
