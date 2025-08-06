'use client'

import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: '設定エラー',
          message: 'システムの設定に問題があります。管理者にお問い合わせください。',
        }
      case 'AccessDenied':
        return {
          title: 'アクセス拒否',
          message: 'アクセス権限がありません。',
        }
      case 'Verification':
        return {
          title: '認証エラー',
          message: 'メールアドレスの確認に失敗しました。',
        }
      case 'Default':
      default:
        return {
          title: 'ログインエラー',
          message: 'ログイン処理中にエラーが発生しました。もう一度お試しください。',
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {errorInfo.title}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {errorInfo.message}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>再度ログインする</span>
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ホームに戻る</span>
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>開発環境情報:</strong>
                <br />
                エラーコード: {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ページを読み込み中...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}