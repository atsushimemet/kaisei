'use client'

import { Event, SettlementCalculation, PaymentSummary, SettlementTransfer } from '@/types'
import { Calculator, Copy, MessageSquare, ArrowRight } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EventDetailPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [settlements, setSettlements] = useState<SettlementCalculation[]>([])
  const [paymentSummaries, setPaymentSummaries] = useState<PaymentSummary[]>([])
  const [transfers, setTransfers] = useState<SettlementTransfer[]>([])
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
      let config = null
      try {
        const savedConfig = localStorage.getItem('settlementRules')
        if (savedConfig) {
          config = JSON.parse(savedConfig)
        }
      } catch (error) {
        console.error('Error loading settlement config:', error)
      }

      // 設定を含めてAPIを呼び出し
      const response = await fetch(`/api/events/${params.id}/settlements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettlements(data.settlements)
        setPaymentSummaries(data.paymentSummaries)
        setTransfers(data.transfers)
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

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString()
  }

  const generateSettlementMessage = (summary: PaymentSummary, transfers: SettlementTransfer[]) => {
    const incomingTransfers = transfers.filter(t => t.to === summary.nickname)
    const outgoingTransfers = transfers.filter(t => t.from === summary.nickname)
    
    let message = `${summary.nickname}さんの精算結果\n\n`
    message += `💰 実際の支払い: ¥${formatCurrency(summary.totalPaid)}\n`
    message += `📊 支払い義務: ¥${formatCurrency(summary.totalOwed)}\n`
    message += `⚖️ 差額: ¥${formatCurrency(Math.abs(summary.balance))} `
    message += summary.balance >= 0 ? '(受け取り)\n\n' : '(支払い)\n\n'

    if (outgoingTransfers.length > 0) {
      message += '💸 支払い先:\n'
      outgoingTransfers.forEach(transfer => {
        message += `  → ${transfer.to}さんに ¥${formatCurrency(transfer.amount)}\n`
      })
    }

    if (incomingTransfers.length > 0) {
      message += '💰 受け取り:\n'
      incomingTransfers.forEach(transfer => {
        message += `  ← ${transfer.from}さんから ¥${formatCurrency(transfer.amount)}\n`
      })
    }

    return message
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
                <p className="text-sm text-gray-500">支払者: {venue.paidBy}さん</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 精算計算 */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">精算計算</h2>
          {paymentSummaries.length === 0 && (
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

        {paymentSummaries.length > 0 && (
          <div className="space-y-8">
            {/* 使用した設定の表示 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📋 使用した設定</h4>
              <div className="text-xs text-blue-800 space-y-1">
                {(() => {
                  let config = null
                  try {
                    const savedConfig = localStorage.getItem('settlementRules')
                    if (savedConfig) {
                      config = JSON.parse(savedConfig)
                    }
                  } catch (error) {
                    console.error('Error loading config for display:', error)
                  }
                  
                  if (config) {
                    return (
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <span className="font-medium">性別調整:</span> 男性{config.genderMultiplier.male}倍, 女性{config.genderMultiplier.female}倍, 未設定{config.genderMultiplier.unspecified}倍
                        </div>
                        <div>
                          <span className="font-medium">役割調整:</span> 先輩{config.roleMultiplier.senior}倍, 後輩{config.roleMultiplier.junior}倍, フラット{config.roleMultiplier.flat}倍
                        </div>
                      </div>
                    )
                  } else {
                    return <div>デフォルト設定を使用</div>
                  }
                })()}
              </div>
            </div>

            {/* 支払い状況サマリー */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">支払い状況</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentSummaries.map((summary) => (
                  <div key={summary.participantId} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{summary.nickname}さん</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>実際の支払い:</span>
                        <span>¥{formatCurrency(summary.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>支払い義務:</span>
                        <span>¥{formatCurrency(summary.totalOwed)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>差額:</span>
                        <span className={summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {summary.balance >= 0 ? '+' : ''}¥{formatCurrency(summary.balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 精算取引 */}
            {transfers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">精算取引</h3>
                <div className="space-y-3">
                  {transfers.map((transfer, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md">
                      <span className="font-medium">{transfer.from}さん</span>
                      <ArrowRight className="w-4 h-4 mx-3 text-gray-500" />
                      <span className="font-medium">{transfer.to}さん</span>
                      <span className="ml-auto text-lg font-semibold text-blue-600">
                        ¥{formatCurrency(transfer.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 個別メッセージ */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">個別精算メッセージ</h3>
              <div className="space-y-4">
                {paymentSummaries.map((summary) => {
                  const message = generateSettlementMessage(summary, transfers)

                  return (
                    <div key={summary.participantId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {summary.nickname}さん
                        </h4>
                        <span className={`text-xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {summary.balance >= 0 ? '+' : ''}¥{formatCurrency(summary.balance)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
                        </div>
                      </div>

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
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
