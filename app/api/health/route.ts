import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const pool = getPool()
    await pool.execute('SELECT 1')
    
    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Health] Error:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
