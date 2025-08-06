import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Render等のプロキシ環境でのHTTPS判定を改善
  const proto = request.headers.get('x-forwarded-proto')
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  
  if (proto && host) {
    // プロキシヘッダーが存在する場合、適切なURLを設定
    const url = `${proto}://${host}${request.nextUrl.pathname}${request.nextUrl.search}`
    response.headers.set('x-forwarded-url', url)
    
    // HTTPS環境であることをNextAuthに伝える
    if (proto === 'https') {
      response.headers.set('x-forwarded-proto', 'https')
    }
  }

  // セキュリティヘッダーの設定
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // 本番環境でのHTTPS強制（プロキシ環境対応）
  if (process.env.NODE_ENV === 'production' && proto !== 'https') {
    const httpsUrl = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`
    return NextResponse.redirect(httpsUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}