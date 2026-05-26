import { NextRequest, NextResponse } from 'next/server'
import { getUserRifas, createRifa, getPool } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth'

// GET - Listar todos los números de rifa del usuario
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

    const rifas = await getUserRifas(decoded.userId as number)

    return NextResponse.json(rifas, { status: 200 })
  } catch (error) {
    console.error('[v0] Error en GET rifas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo número de rifa
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { numero, descripcion } = body

    if (!numero) {
      return NextResponse.json(
        { error: 'El número es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el número ya existe para este usuario
    const pool = getPool()
    const [existing] = await pool.execute(
      'SELECT id FROM rifas WHERE user_id = ? AND numero = ?',
      [decoded.userId as number, numero]
    )
    const existingRifas = existing as any[]

    if (existingRifas.length > 0) {
      return NextResponse.json(
        { error: 'Este número ya existe' },
        { status: 400 }
      )
    }

    const rifa = await createRifa({
      userId: decoded.userId as number,
      numero,
      descripcion,
    })

    return NextResponse.json(
      { message: 'Número de rifa creado exitosamente', id: rifa.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error en POST rifa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
