'use client'

import { ArrowRight, ChevronDown, ChevronRight, Copy, Download, MessageCircle, MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'

interface PaymentSummary {
  participantId: number
  nickname: string
  totalPaid: number
  totalOwed: number
  balance: number
}

interface SettlementTransfer {
  from: string
  to: string
  amount: number
}

interface SettlementCalculation {
  participantId: number
  breakdown: {
    venueId: number
    venueName: string
    baseAmount: number
    adjustedAmount: number
    factors: {
      stayRange: number
      gender: number
      role: number
    }
  }[]
}

interface Venue {
  id: number
  venueOrder: number
  name: string
  totalAmount: number
  paidBy: string
}

interface Event {
  id?: number
  title: string
  eventDate: string | Date
  venues: Venue[]
}

interface SettlementResultProps {
  event: Event
  paymentSummaries: PaymentSummary[]
  settlements: SettlementCalculation[]
  transfers: SettlementTransfer[]
  onCopy?: (message: string, participantName?: string) => void
  showDetailedBreakdown?: boolean
}

export default function SettlementResult({
  event,
  paymentSummaries,
  settlements,
  transfers,
  onCopy,
  showDetailedBreakdown = false
}: SettlementResultProps) {
  const [expandedAccordions, setExpandedAccordions] = useState<{[key: string]: boolean}>({})

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString()
  }

  const toggleAccordion = (key: string) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const generateSettlementMessage = (summary: PaymentSummary, participantTransfers: SettlementTransfer[]) => {
    let message = `【精算のお願い】\n${summary.nickname}さん\n\n`
    message += `ありがとうございました！\n`
    message += `${event?.title || '飲み会'} の精算をお願いします。\n\n`
    
    message += `■ 精算内容\n`
    message += `支払い総額: ¥${formatCurrency(summary.totalPaid)}\n`
    message += `負担総額: ¥${formatCurrency(summary.totalOwed)}\n`
    message += `差額: ¥${formatCurrency(summary.balance)}`
    
    if (summary.balance > 0) {
      message += `（受け取り）\n\n`
    } else if (summary.balance < 0) {
      message += `（支払い）\n\n`
    } else {
      message += `（収支一致）\n\n`
    }

    if (participantTransfers.length > 0) {
      message += `■ 精算方法\n`
      participantTransfers.forEach((transfer) => {
        message += `${transfer.from} → ${transfer.to}: ¥${formatCurrency(transfer.amount)}\n`
      })
      message += `\n`
    } else if (summary.balance === 0) {
      message += `■ 精算方法\n精算は不要です（収支が一致しています）\n\n`
    }

    message += `よろしくお願いします🙏`

    return message
  }

  const copyToClipboard = (text: string, participantName?: string) => {
    if (onCopy) {
      onCopy(text, participantName)
    }
  }

  const copyAllResults = () => {
    const resultText = `
🍺 ${event.title} 精算結果

📅 開催日: ${typeof event.eventDate === 'string' ? event.eventDate : event.eventDate.toLocaleDateString()}
💰 総額: ¥${paymentSummaries.reduce((sum, p) => sum + p.totalPaid, 0).toLocaleString()}

👥 参加者別精算結果:
${paymentSummaries.map((summary) => 
  `• ${summary.nickname}: 支払い¥${formatCurrency(summary.totalPaid)} / 負担¥${formatCurrency(summary.totalOwed)} / 差額¥${formatCurrency(summary.balance)}`
).join('\n')}

📊 推奨精算方法:
${transfers.map((transfer) => 
  `• ${transfer.from} → ${transfer.to}: ¥${formatCurrency(transfer.amount)}`
).join('\n')}

---
KAISEI - 飲み会精算支援アプリ
    `.trim()

    copyToClipboard(resultText)
  }

  const downloadResult = () => {
    const resultText = `
🍺 ${event.title} 精算結果

📅 開催日: ${typeof event.eventDate === 'string' ? event.eventDate : event.eventDate.toLocaleDateString()}
💰 総額: ¥${paymentSummaries.reduce((sum, p) => sum + p.totalPaid, 0).toLocaleString()}

👥 参加者別精算結果:
${paymentSummaries.map((summary) => 
  `• ${summary.nickname}: 支払い¥${formatCurrency(summary.totalPaid)} / 負担¥${formatCurrency(summary.totalOwed)} / 差額¥${formatCurrency(summary.balance)}`
).join('\n')}

📊 推奨精算方法:
${transfers.map((transfer) => 
  `• ${transfer.from} → ${transfer.to}: ¥${formatCurrency(transfer.amount)}`
).join('\n')}

---
KAISEI - 飲み会精算支援アプリ
    `.trim()

    const blob = new Blob([resultText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title}_精算結果.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareToLine = () => {
    const resultText = `
🍺 ${event.title} 精算結果

📅 開催日: ${typeof event.eventDate === 'string' ? event.eventDate : event.eventDate.toLocaleDateString()}
💰 総額: ¥${paymentSummaries.reduce((sum, p) => sum + p.totalPaid, 0).toLocaleString()}

👥 参加者別精算結果:
${paymentSummaries.map((summary) => 
  `• ${summary.nickname}: 支払い¥${formatCurrency(summary.totalPaid)} / 負担¥${formatCurrency(summary.totalOwed)} / 差額¥${formatCurrency(summary.balance)}`
).join('\n')}

📊 推奨精算方法:
${transfers.map((transfer) => 
  `• ${transfer.from} → ${transfer.to}: ¥${formatCurrency(transfer.amount)}`
).join('\n')}

---
KAISEI - 飲み会精算支援アプリ
    `.trim()

    const encodedText = encodeURIComponent(resultText)
    const lineShareUrl = `https://line.me/R/msg/text/?${encodedText}`
    window.open(lineShareUrl, '_blank')
  }

  if (!paymentSummaries || paymentSummaries.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* 使用した設定の表示 */}
      {showDetailedBreakdown && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">📋 使用した設定</h4>
          <div className="text-xs text-blue-800 space-y-2">
            {(() => {
              let config = null
              let isDefault = true
              try {
                const savedConfig = localStorage.getItem('settlementRules')
                if (savedConfig) {
                  config = JSON.parse(savedConfig)
                  isDefault = false
                }
              } catch (error) {
                console.error('Error loading config for display:', error)
              }
              
              if (config) {
                return (
                  <div className="space-y-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${isDefault ? 'bg-gray-200 text-gray-700' : 'bg-green-200 text-green-800'}`}>
                      {isDefault ? 'デフォルト設定' : 'カスタム設定'}を使用
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <span className="font-medium">性別調整:</span>
                        <div className="ml-2">
                          男性 {config.genderMultiplier?.male || 1.0}倍<br/>
                          女性 {config.genderMultiplier?.female || 1.0}倍<br/>
                          未設定 {config.genderMultiplier?.unspecified || 1.0}倍
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">役割調整:</span>
                        <div className="ml-2">
                          先輩 {config.roleMultiplier?.senior || 1.0}倍<br/>
                          後輩 {config.roleMultiplier?.junior || 1.0}倍<br/>
                          フラット {config.roleMultiplier?.flat || 1.0}倍
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">滞在時間調整:</span>
                        <div className="ml-2 text-xs">
                          各参加者の滞在時間の割合（0.0〜1.0）に応じて支払額を自動調整。<br/>
                          例: 3次会を70%参加の場合、その会の支払いは70%になります。
                        </div>
                      </div>
                    </div>
                  </div>
                )
              } else {
                return (
                  <div className="space-y-2">
                    <div className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                      デフォルト設定を使用
                    </div>
                    <div className="text-xs">
                      性別・役割による調整なし（全員1.0倍）<br/>
                      滞在時間による調整は各参加者の参加率に応じて自動適用されます
                    </div>
                  </div>
                )
              }
            })()}
          </div>
        </div>
      )}

      {/* 精算結果 */}
      <div className="space-y-6">
        {paymentSummaries.map((summary) => (
          <div key={summary.nickname} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-shrink-0">
                {summary.nickname}さんの精算結果
              </h3>
              <button
                onClick={() => {
                  const participantTransfers = transfers.filter(t => t.from === summary.nickname || t.to === summary.nickname)
                  const message = generateSettlementMessage(summary, participantTransfers)
                  copyToClipboard(message, summary.nickname)
                }}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1.5 flex-shrink-0"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap"> 精算をお願い</span>
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {/* 支払い総額アコーディオン */}
              <div className="text-center">
                <button
                  onClick={() => toggleAccordion(`paid-${summary.nickname}`)}
                  className="flex items-center justify-center w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      ¥{formatCurrency(summary.totalPaid)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center">
                      支払い総額
                      {expandedAccordions[`paid-${summary.nickname}`] ? (
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      ) : (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      )}
                    </div>
                  </div>
                </button>
                {expandedAccordions[`paid-${summary.nickname}`] && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-left">
                    <h5 className="font-medium text-blue-900 mb-2">支払い詳細</h5>
                    <div className="space-y-1 text-sm text-blue-800">
                      {(() => {
                        const paidVenues = event.venues.filter(venue => venue.paidBy === summary.nickname)
                        if (paidVenues.length === 0) {
                          return <p>支払ったお店はありません</p>
                        }
                        return paidVenues
                          .sort((a, b) => a.venueOrder - b.venueOrder)
                          .map((venue) => (
                            <div key={venue.id} className="flex justify-between">
                              <span>{venue.venueOrder}次会: {venue.name}</span>
                              <span>¥{formatCurrency(venue.totalAmount)}</span>
                            </div>
                          ))
                      })()}
                      <div className="border-t pt-1 mt-2 font-medium flex justify-between">
                        <span>合計</span>
                        <span>¥{formatCurrency(summary.totalPaid)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 負担総額アコーディオン */}
              <div className="text-center">
                <button
                  onClick={() => toggleAccordion(`owed-${summary.nickname}`)}
                  className="flex items-center justify-center w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      ¥{formatCurrency(summary.totalOwed)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center">
                      負担総額
                      {expandedAccordions[`owed-${summary.nickname}`] ? (
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      ) : (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      )}
                    </div>
                  </div>
                </button>
                {showDetailedBreakdown && expandedAccordions[`owed-${summary.nickname}`] && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg text-left">
                    <h5 className="font-medium text-green-900 mb-2">負担詳細</h5>
                    <div className="space-y-2 text-sm text-green-800">
                      {(() => {
                        const settlement = settlements.find(s => s.participantId === summary.participantId)
                        
                        if (!settlement) {
                          return <p>計算データがありません</p>
                        }
                        return settlement.breakdown.map((item) => {
                          const venue = event.venues.find(v => v.id === item.venueId)
                          const venueOrder = venue?.venueOrder || 1
                          return (
                            <div key={item.venueId} className="space-y-1">
                              <div className="font-medium">{venueOrder}次会: {item.venueName}</div>
                              <div className="ml-2 text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span>基本金額:</span>
                                  <span>¥{formatCurrency(item.baseAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>参加率: {item.factors.stayRange}</span>
                                  <span>性別: {item.factors.gender}倍</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>役割: {item.factors.role}倍</span>
                                  <span className="font-medium">¥{formatCurrency(item.adjustedAmount)}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      })()}
                      <div className="border-t pt-1 mt-2 font-medium flex justify-between">
                        <span>合計</span>
                        <span>¥{formatCurrency(summary.totalOwed)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 差額アコーディオン */}
              <div className="text-center">
                <button
                  onClick={() => toggleAccordion(`balance-${summary.nickname}`)}
                  className="flex items-center justify-center w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div>
                    <div className={`text-xl sm:text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ¥{formatCurrency(summary.balance)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center">
                      差額
                      {expandedAccordions[`balance-${summary.nickname}`] ? (
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      ) : (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      )}
                    </div>
                  </div>
                </button>
                {expandedAccordions[`balance-${summary.nickname}`] && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-left">
                    <h5 className="font-medium text-gray-900 mb-2">差額計算</h5>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>支払い総額:</span>
                        <span>¥{formatCurrency(summary.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>負担総額:</span>
                        <span>¥{formatCurrency(summary.totalOwed)}</span>
                      </div>
                      <div className="border-t pt-1 mt-1 font-medium flex justify-between">
                        <span>差額:</span>
                        <span className={summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ¥{formatCurrency(summary.balance)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {summary.balance > 0 
                          ? '他の参加者から受け取る金額' 
                          : summary.balance < 0 
                            ? '他の参加者に支払う金額'
                            : '精算不要（収支が一致）'
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(() => {
              if (summary.balance > 0) {
                return (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center text-yellow-800">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="font-medium">精算が必要です</span>
                    </div>
                    <div className="mt-2 text-sm text-yellow-700">
                      {summary.nickname}さんは他の参加者から精算を受け取る必要があります。
                    </div>
                  </div>
                )
              } else if (summary.balance < 0) {
                return (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center text-red-800">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="font-medium">精算が必要です</span>
                    </div>
                    <div className="mt-2 text-sm text-red-700">
                      {summary.nickname}さんは他の参加者に精算を支払う必要があります。
                    </div>
                  </div>
                )
              } else {
                return (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-green-800">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="font-medium">精算は不要です</span>
                    </div>
                    <div className="mt-2 text-sm text-green-700">
                      {summary.nickname}さんの支払いと負担が一致しています。
                    </div>
                  </div>
                )
              }
            })()}
          </div>
        ))}
      </div>

      {/* 精算方法 */}
      {transfers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">推奨精算方法</h4>
          <div className="space-y-3">
            {transfers.map((transfer, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{transfer.from}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{transfer.to}</span>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  ¥{formatCurrency(transfer.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={copyAllResults}
          className="flex items-center justify-center space-x-2 w-48 h-12 px-6 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Copy className="w-4 h-4" />
          <span>結果をコピー</span>
        </button>
        <button
          onClick={downloadResult}
          className="flex items-center justify-center space-x-2 w-48 h-12 px-6 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>ファイルをダウンロード</span>
        </button>
        <button
          onClick={shareToLine}
          className="flex items-center justify-center space-x-2 w-48 h-12 px-6 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-white" />
          <span>LINEで共有</span>
        </button>
      </div>
    </div>
  )
}