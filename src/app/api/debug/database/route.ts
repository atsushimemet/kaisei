import { getPrisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 })
  }

  try {
    const prisma = getPrisma()
    
    // データベース接続テスト
    await prisma.$queryRaw`SELECT 1`
    
    // テーブル一覧取得
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    const tableNames = tables.map(t => t.table_name)
    
    // NextAuth必須テーブルの存在確認
    const requiredTables = ['accounts', 'sessions', 'users', 'verificationtokens']
    const missingTables = requiredTables.filter(table => !tableNames.includes(table))
    
    // accounts テーブルのレコード数確認
    let accountsCount = 0
    let usersCount = 0
    try {
      if (tableNames.includes('accounts')) {
        accountsCount = await prisma.accounts.count()
      }
      if (tableNames.includes('users')) {
        accountsCount = await prisma.users.count()
      }
    } catch (error) {
      console.error('Error counting records:', error)
    }

    return NextResponse.json({
      connectionStatus: 'connected',
      tablesExist: tableNames,
      missingTables,
      recordCounts: {
        accounts: accountsCount,
        users: usersCount
      },
      databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Database debug error:', error)
    
    return NextResponse.json({
      connectionStatus: 'failed',
      error: error.message,
      tablesExist: [],
      missingTables: ['unknown'],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}