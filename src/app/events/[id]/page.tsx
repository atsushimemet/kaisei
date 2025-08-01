'use client'

import { formatCurrency, generateSettlementMessage } from '@/lib/utils'
import { Event, SettlementCalculation } from '@/types'
import { Calculator, Copy, MessageSquare } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EventDetailPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [calculations, setCalculations] = useState<SettlementCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSettlements = async () => {
    setCalculating(true)
    try {
      // ローカルストレージから設定を取得
      const savedRules = localStorage.getItem('settlementRules')
      const rules = savedRules ? JSON.parse(savedRules) : null

      const response = await fetch(`/api/events/${params.id}/settlements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules }),
      })
      if (response.ok) {
        const data = await response.json()
        setCalculations(data.calculations)
        setEvent(data.event)
      }
    } catch (error) {
      console.error('Error calculating settlements:', error)
    } finally {
      setCalculating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('クリップボードにコピーしました')
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card': return 'クレジットカード'
      case 'cash': return '現金'
      case 'paypay': return 'PayPay'
      case 'quicpay': return 'QUICPay'
      case 'other': return 'その他'
      default: return method || '未設定'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">飲み会が見つかりません</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* イベント情報 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
        <p className="text-gray-600">
          開催日: {new Date(event.eventDate).toLocaleDateString('ja-JP')}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 参加者情報 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">参加者</h2>
          <div className="space-y-3">
            {event.participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium">{participant.nickname}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({participant.gender === 'male' ? '男性' : participant.gender === 'female' ? '女性' : '未設定'} / 
                    {participant.role === 'senior' ? '先輩' : participant.role === 'junior' ? '後輩' : 'フラット'})
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {participant.stayRange.firstParty && '1次会'}
                  {participant.stayRange.secondParty && ' 2次会'}
                  {participant.stayRange.thirdParty && ' 3次会'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* お店情報 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">お店</h2>
          <div className="space-y-3">
            {event.venues.map((venue) => (
              <div key={venue.id} className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{venue.venueOrder}次会: {venue.name}</span>
                  <span className="text-lg font-semibold text-blue-600">
                    ¥{formatCurrency(venue.totalAmount)}
                  </span>
                </div>
                {venue.paymentMethod && (
                  <p className="text-sm text-gray-500">支払方法: {getPaymentMethodLabel(venue.paymentMethod)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 精算計算 */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">精算計算</h2>
          {calculations.length === 0 && (
            <button
              onClick={calculateSettlements}
              disabled={calculating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Calculator className="w-4 h-4 inline mr-2" />
              {calculating ? '計算中...' : '精算を計算'}
            </button>
          )}
        </div>

        {calculations.length > 0 && (
          <div className="space-y-6">
            {calculations.map((calculation) => {
              const participant = event.participants.find(p => p.id === calculation.participantId)
              if (!participant) return null

              const message = generateSettlementMessage(participant, calculation, event)

              return (
                <div key={calculation.participantId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {calculation.nickname} さん
                    </h3>
                    <span className="text-2xl font-bold text-blue-600">
                      ¥{formatCurrency(calculation.amount)}
                    </span>
                  </div>

                  {/* 内訳 */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">内訳</h4>
                    <div className="space-y-2">
                      {calculation.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.venueName}</span>
                          <span>¥{formatCurrency(item.adjustedAmount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* メッセージ */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">支払案内メッセージ</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="whitespace-pre-wrap text-sm">{message}</pre>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(message)}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      メッセージをコピー
                    </button>
                    <button
                      onClick={() => {
                        // LINEで送信する処理（実装予定）
                        alert('LINE送信機能は今後実装予定です')
                      }}
                      className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      LINEで送信
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 
