import { NextRequest, NextResponse } from 'next/server'
import { getRifaById, updateRifa, deleteRifa } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth'

// PUT - Actualizar número de rifa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { numero, descripcion, estado } = body

    // Verificar que el registro pertenece al usuario
    const rifa = await getRifaById(parseInt(id))

    if (!rifa || rifa.user_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para actualizar este registro' },
        { status: 403 }
      )
    }

    await updateRifa(parseInt(id), {
      numero,
      descripcion,
      estado,
    })

    return NextResponse.json(
      { message: 'Número de rifa actualizado' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error en PUT rifa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar número de rifa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verificar que el registro pertenece al usuario
    const rifa = await getRifaById(parseInt(id))

    if (!rifa || rifa.user_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este registro' },
        { status: 403 }
      )
    }

    await deleteRifa(parseInt(id))

    return NextResponse.json(
      { message: 'Número de rifa eliminado' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error en DELETE rifa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
