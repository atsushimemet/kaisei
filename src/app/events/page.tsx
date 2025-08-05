'use client'

import { Event } from '@/types'
import { Calendar, Loader2, LogIn, MapPin, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEvents()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchEvents = async () => {
    try {
      setError(null)
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        console.error('Failed to fetch events')
        setError('イベントの取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('イベントの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString()
  }

  // 認証状態のローディング
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">認証状態を確認中...</span>
        </div>
      </div>
    )
  }

  // 未認証の場合
  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <LogIn className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ログインが必要です</h1>
            <p className="text-gray-600 mb-6">
              飲み会の一覧を確認するには、Googleアカウントでログインしてください。
              <br />
              ログインすることで、あなたが作成した飲み会を管理できるようになります。
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin?callbackUrl=/events"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Googleでログイン
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>または</p>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ホームに戻る
              </Link>
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-500">
            <p className="mb-2">ログインすると以下が可能になります：</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-700 mb-1">飲み会作成</h4>
                <p>新しい飲み会を作成して参加者を管理</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-700 mb-1">一覧表示</h4>
                <p>作成した飲み会の一覧を確認</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-700 mb-1">精算管理</h4>
                <p>精算データの保存と共有</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // データ取得中のローディング
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">飲み会一覧を読み込み中...</span>
        </div>
      </div>
    )
  }

  // エラーが発生した場合
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={fetchEvents}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
            
            <div className="text-sm text-gray-500">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">飲み会一覧</h1>
        <p className="text-gray-600">
          作成した飲み会の一覧です。タイトルをクリックして詳細を確認できます。
          {session?.user && (
            <span className="block text-sm text-gray-500 mt-1">
              ログイン中: {session.user.name || session.user.email}
            </span>
          )}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">まだ飲み会が作成されていません</div>
          <Link
            href="/events/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            新しい飲み会を作成
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {event.title}
                </h2>
                <div className="text-sm text-gray-500">
                  {formatDate(event.eventDate)}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.eventDate)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{event.participants.length}名参加</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venues.length}次会まで</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    総額: ¥{formatCurrency(event.venues.reduce((sum, venue) => sum + venue.totalAmount, 0))}
                  </div>
                  <div className="text-blue-600 font-medium">
                    詳細を見る →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/events/new"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          新しい飲み会を作成
        </Link>
      </div>
    </div>
  )
}
