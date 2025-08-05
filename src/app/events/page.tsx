'use client'

import { Event } from '@/types'
import { Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        console.error('Failed to fetch events')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">飲み会一覧</h1>
        <p className="text-gray-600">作成した飲み会の一覧です。タイトルをクリックして詳細を確認できます。</p>
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