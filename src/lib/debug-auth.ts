// NextAuth認証デバッグ用ユーティリティ

export const debugLog = (phase: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [NextAuth Debug] ${phase}:`, {
      timestamp: new Date().toISOString(),
      ...data
    })
  }
}

export const debugError = (phase: string, error: any) => {
  console.error(`❌ [NextAuth Error] ${phase}:`, {
    timestamp: new Date().toISOString(),
    error: error.message || error,
    stack: error.stack
  })
}

export const debugCookie = (req: any) => {
  const cookies = req?.cookies || {}
  const sessionToken = cookies['next-auth.session-token']
  const callbackUrl = cookies['next-auth.callback-url']
  const csrfToken = cookies['next-auth.csrf-token']
  
  debugLog('Cookie Analysis', {
    hasSessionToken: !!sessionToken,
    sessionTokenLength: sessionToken?.length || 0,
    hasCallbackUrl: !!callbackUrl,
    hasCsrfToken: !!csrfToken,
    allCookieNames: Object.keys(cookies)
  })
}

export const debugDatabase = async (prisma: any) => {
  try {
    // データベース接続テスト
    await prisma.$queryRaw`SELECT 1`
    debugLog('Database Connection', { status: 'connected' })
    
    // テーブル存在確認
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    debugLog('Database Tables', { 
      tables: tables.map((t: any) => t.table_name),
      hasAccounts: tables.some((t: any) => t.table_name === 'accounts'),
      hasUsers: tables.some((t: any) => t.table_name === 'users'),
      hasSessions: tables.some((t: any) => t.table_name === 'sessions')
    })
    
  } catch (error) {
    debugError('Database Connection', error)
  }
}