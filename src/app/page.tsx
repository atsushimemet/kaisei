import ClientLogger from '@/components/ClientLogger'
import { Calculator, CreditCard, LogIn, Plus, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <ClientLogger componentName="HomePage" />
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍺 KAISEI
          </h1>
          <p className="text-xl text-gray-600">
            飲み会精算支援アプリ
          </p>
          <p className="text-gray-500 mt-2">
            3〜6人規模の飲み会に特化した精算支援ツール
          </p>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-4xl mx-auto">
          {/* 機能紹介 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              主な機能
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">飲み会登録</h3>
                <p className="text-gray-600 text-sm">
                  参加者とお店情報を簡単に登録
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">参加者管理</h3>
                <p className="text-gray-600 text-sm">
                  性別・役割・滞在時間を考慮
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">傾斜配分</h3>
                <p className="text-gray-600 text-sm">
                  ローカルルールを反映した自動計算
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">支払案内</h3>
                <p className="text-gray-600 text-sm">
                  各参加者向けの精算メッセージ生成
                </p>
              </div>
            </div>
          </section>

          {/* 利用方法の選択 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              利用方法を選択してください
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* ログインなしで精算 */}
              <div className="bg-white p-8 rounded-lg shadow-md border-2 border-blue-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    すぐに精算を始める
                  </h3>
                  <p className="text-gray-600 text-sm">
                    ログイン不要で一度きりの精算を実行
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">すぐに精算を開始</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">データは保存されません</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">結果をコピーして共有</span>
                  </div>
                </div>

                <Link
                  href="/events/new/quick"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  すぐに精算を始める
                </Link>
              </div>

              {/* ログインして管理 */}
              <div className="bg-white p-8 rounded-lg shadow-md border-2 border-green-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    ログインして管理
                  </h3>
                  <p className="text-gray-600 text-sm">
                    データを保存して継続的に管理
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">データを永続化</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">過去の精算履歴を確認</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">設定をカスタマイズ</span>
                  </div>
                </div>

                <Link
                  href="/auth/signin"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  ログインして始める
                </Link>
              </div>
            </div>
          </section>

          {/* 利用シーン */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              利用シーン
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">急な飲み会</h3>
                </div>
                <p className="text-gray-600 text-sm text-center">
                  急に決まった飲み会の精算を素早く実行
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">定期的な飲み会</h3>
                </div>
                <p className="text-gray-600 text-sm text-center">
                  定期的な飲み会の精算を効率的に管理
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">精算履歴</h3>
                </div>
                <p className="text-gray-600 text-sm text-center">
                  過去の精算履歴を確認して分析
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* フッター */}
        <footer className="mt-16 text-center text-gray-500">
          <p>&copy; 2024 KAISEI. All rights reserved.</p>
        </footer>
      </div>
    </>
  )
} 
