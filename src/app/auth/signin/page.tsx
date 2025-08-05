'use client'

import { ArrowLeft, Calculator, Chrome, List, Shield } from 'lucide-react'
import { getProviders, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignInPage() {
  const [providers, setProviders] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/events'

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  const handleSignIn = async (providerId: string) => {
    setLoading(true)
    try {
      await signIn(providerId, { callbackUrl })
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h1>
            <p className="text-gray-600">
              飲み会の管理にはGoogleアカウントでのログインが必要です
            </p>
          </div>

          <div className="space-y-4">
            {providers &&
              Object.values(providers).map((provider: any) => (
                <button
                  key={provider.name}
                  onClick={() => handleSignIn(provider.id)}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Chrome className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium text-lg">
                    {loading ? 'ログイン中...' : `${provider.name}でログイン`}
                  </span>
                </button>
              ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              ホームに戻る
            </Link>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
              ログインすると以下が可能になります：
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <List className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">飲み会一覧の確認</h4>
                  <p className="text-xs text-gray-500">過去に作成した飲み会の一覧を確認・管理</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">精算データの永続化</h4>
                  <p className="text-xs text-gray-500">精算データを安全に保存・共有</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">セキュアな管理</h4>
                  <p className="text-xs text-gray-500">あなたのデータを安全に管理</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>
              ログインすることで、あなたのGoogleアカウント情報を使用して
              <br />
              安全にアプリケーションにアクセスできます。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
