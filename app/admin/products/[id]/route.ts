import { NextResponse } from 'next/server'
import { getProductWithSeller } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const resultado = await getProductWithSeller(id)

  if (!resultado) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  return NextResponse.json(resultado)
}