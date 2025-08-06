import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 })
  }

  // サーバーサイドの環境変数を確認
  const envInfo = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (hidden)' : 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET (hidden)' : 'NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    
    // NextAuth自動設定値
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL || 'NOT SET',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
    
    // リクエスト情報
    requestUrl: request.url,
    requestHost: request.headers.get('host'),
    requestProtocol: request.headers.get('x-forwarded-proto') || 'http'
  }

  console.log('🔍 Environment Debug:', envInfo)

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ...envInfo
  })
}