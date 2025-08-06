import { getPrisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // アプリケーション自体は健全であることを示す
    const baseResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      application: 'running'
    }

    try {
      // データベース接続をテスト（タイムアウト設定）
      const prisma = getPrisma()
      await Promise.race([
        prisma.$queryRaw`SELECT 1 as test`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ])
      
      return NextResponse.json(
        { 
          ...baseResponse,
          database: 'connected'
        },
        { status: 200 }
      )
    } catch (dbError) {
      // データベース接続は失敗したが、アプリケーション自体は健全
      console.warn('Database connection failed during health check:', dbError)
      return NextResponse.json(
        { 
          ...baseResponse,
          database: 'disconnected',
          database_error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 200 } // アプリケーション自体は健全なので200を返す
      )
    }
  } catch (error) {
    console.error('Application health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        application: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
} 
