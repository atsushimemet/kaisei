import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 })
  }

  const url = new URL(request.url)
  const cookies = request.cookies
  
  // NextAuth関連のCookie確認
  const sessionToken = cookies.get('next-auth.session-token')?.value
  const callbackUrl = cookies.get('next-auth.callback-url')?.value
  const csrfToken = cookies.get('next-auth.csrf-token')?.value
  
  // リクエストヘッダー確認
  const headers = Object.fromEntries(request.headers.entries())
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    requestUrl: request.url,
    method: request.method,
    headers: {
      host: headers.host,
      userAgent: headers['user-agent']?.substring(0, 100) + '...',
      referer: headers.referer,
      cookie: headers.cookie ? 'SET (hidden)' : 'NOT SET'
    },
    cookies: {
      sessionToken: sessionToken ? {
        exists: true,
        length: sessionToken.length,
        preview: sessionToken.substring(0, 10) + '...'
      } : null,
      callbackUrl: callbackUrl || null,
      csrfToken: csrfToken ? 'SET (hidden)' : null,
      allCookieNames: Array.from(cookies.keys())
    },
    environment: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      hasDatabaseUrl: !!process.env.DATABASE_URL
    }
  }

  console.log('🔍 [Auth Debug] Request analysis:', debugInfo)

  return NextResponse.json(debugInfo)
}