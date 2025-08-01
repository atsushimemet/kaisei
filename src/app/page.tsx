import { Calculator, CreditCard, Plus, Users } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
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

        {/* CTA */}
        <section className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              新しい飲み会を始めましょう
            </h2>
            <p className="text-gray-600 mb-6">
              幹事の負担を軽減し、透明性のある精算を実現します
            </p>
            <Link
              href="/events/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              飲み会を作成
            </Link>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="mt-16 text-center text-gray-500">
        <p>&copy; 2024 KAISEI. All rights reserved.</p>
      </footer>
    </div>
  )
} 
