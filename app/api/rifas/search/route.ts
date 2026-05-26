import { NextRequest, NextResponse } from 'next/server'
import { searchRifas } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query) {
      return NextResponse.json(
        { error: 'Se requiere un término de búsqueda' },
        { status: 400 }
      )
    }

    const results = await searchRifas(query, decoded.userId as number)

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('[v0] Error en búsqueda:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
