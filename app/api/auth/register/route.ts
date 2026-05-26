import { NextRequest, NextResponse } from 'next/server'
import { getUser, getPool } from '@/lib/db'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await getUser(email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya existe' },
        { status: 400 }
      )
    }

    // Hashear contraseña y crear usuario
    const hashedPassword = await hashPassword(password)
    const pool = getPool()
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    )
    const insertResult = result as any
    const userId = insertResult.insertId

    const token = await createToken(userId, email)

    const response = NextResponse.json(
      { message: 'Usuario registrado exitosamente', userId },
      { status: 201 }
    )

    await setAuthCookie(token)
    return response
  } catch (error) {
    console.error('[v0] Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
