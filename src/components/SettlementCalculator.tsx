'use client'

import { calculateQuickSettlement } from '@/lib/settlement'
import { DEFAULT_SETTLEMENT_RULES, SettlementRules } from '@/types'
import { AlertCircle, Copy, Download, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Participant {
  id: string
  nickname: string
  gender: 'male' | 'female' | 'unspecified'
  role: 'senior' | 'junior' | 'flat'
  stayRange: {
    firstParty: number
    secondParty: number
    thirdParty: number
  }
}

interface Venue {
  id: string
  venueOrder: number
  name: string
  googleMapsUrl?: string
  totalAmount: number | string
  paidBy: string
}

interface Event {
  title: string
  eventDate: string
  participants: Participant[]
  venues: Venue[]
}

interface SettlementCalculatorProps {
  event: Event
  onBack?: () => void
  onSave?: (result: any) => void
  isLoggedIn?: boolean
}

// ツールチップコンポーネント
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-8 transform -translate-y-full">
          {content}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default function SettlementCalculator({ 
  event, 
  onBack, 
  onSave, 
  isLoggedIn = false 
}: SettlementCalculatorProps) {
  const [rules, setRules] = useState<SettlementRules>(DEFAULT_SETTLEMENT_RULES)
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')

  useEffect(() => {
    // ローカルストレージから設定を読み込み
    const savedRules = localStorage.getItem('settlementRules')
    if (savedRules) {
      try {
        const parsed = JSON.parse(savedRules)
        setRules(parsed)
      } catch (error) {
        console.error('Error parsing saved rules:', error)
      }
    }
  }, [])

  // 参加者の滞在率から何次会まで発生するかを計算
  const calculateMaxPartyCount = () => {
    if (event.participants.length === 0) return 0

    let maxParty = 0
    event.participants.forEach(participant => {
      if (participant.stayRange.firstParty > 0) maxParty = Math.max(maxParty, 1)
      if (participant.stayRange.secondParty > 0) maxParty = Math.max(maxParty, 2)
      if (participant.stayRange.thirdParty > 0) maxParty = Math.max(maxParty, 3)
    })

    return maxParty
  }

  // 滞在率が正しく設定されているかチェック
  const validateStayRates = () => {
    const unsetParticipants = event.participants.filter(p => 
      p.stayRange.firstParty === 0 && p.stayRange.secondParty === 0 && p.stayRange.thirdParty === 0
    )

    if (unsetParticipants.length > 0) {
      const names = unsetParticipants.map(p => p.nickname || '未設定').join('、')
      setPopupMessage(`${names}の⚪︎次回滞在率が設定されていません。滞在率を設定してから会場を追加してください。`)
      setShowPopup(true)
      return false
    }

    return true
  }

  const calculateSettlement = () => {
    if (event.participants.length === 0 || event.venues.length === 0) {
      alert('参加者と会場を入力してください')
      return
    }

    // 共通の精算計算関数を使用
    const result = calculateQuickSettlement(event.participants, event.venues, rules)
    
    const fullResult = {
      ...result,
      event,
      rules
    }
    
    setCalculationResult(fullResult)
    
    // ログイン済みの場合は保存コールバックを呼び出し
    if (isLoggedIn && onSave) {
      onSave(fullResult)
    }
  }

  const copyResult = () => {
    if (!calculationResult) return

    const resultText = `
🍺 ${calculationResult.event.title} 精算結果

📅 開催日: ${calculationResult.event.eventDate}
💰 総額: ¥${calculationResult.totalAmount.toLocaleString()}

👥 参加者別精算額:
${calculationResult.participants.map((p: any) => 
  `• ${p.nickname}: ¥${p.amount.toLocaleString()}`
).join('\n')}

📊 計算詳細:
${calculationResult.participants.map((p: any) => 
  `• ${p.nickname}: 係数${p.multiplier.toFixed(2)}倍`
).join('\n')}

---
KAISEI - 飲み会精算支援アプリ
    `.trim()

    navigator.clipboard.writeText(resultText).then(() => {
      alert('結果をクリップボードにコピーしました')
    }).catch(() => {
      alert('コピーに失敗しました')
    })
  }

  const downloadResult = () => {
    if (!calculationResult) return

    const resultText = `
🍺 ${calculationResult.event.title} 精算結果

📅 開催日: ${calculationResult.event.eventDate}
💰 総額: ¥${calculationResult.totalAmount.toLocaleString()}

👥 参加者別精算額:
${calculationResult.participants.map((p: any) => 
  `• ${p.nickname}: ¥${p.amount.toLocaleString()}`
).join('\n')}

📊 計算詳細:
${calculationResult.participants.map((p: any) => 
  `• ${p.nickname}: 係数${p.multiplier.toFixed(2)}倍`
).join('\n')}

---
KAISEI - 飲み会精算支援アプリ
    `.trim()

    const blob = new Blob([resultText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${calculationResult.event.title}_精算結果.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareToLine = () => {
    if (!calculationResult) return

    const resultText = `
🍺 ${calculationResult.event.title} 精算結果

📅 開催日: ${calculationResult.event.eventDate}
💰 総額: ¥${calculationResult.totalAmount.toLocaleString()}

👥 参加者別精算額:
${calculationResult.participants.map((p: any) => 
  `• ${p.nickname}: ¥${p.amount.toLocaleString()}`
).join('\n')}

📊 計算詳細:
${calculationResult.participants.map((p: any) => 
  `• ${p.nickname}: 係数${p.multiplier.toFixed(2)}倍`
).join('\n')}

---
KAISEI - 飲み会精算支援アプリ
    `.trim()

    // LINEで共有するためのURLエンコード
    const encodedText = encodeURIComponent(resultText)
    const lineShareUrl = `https://line.me/R/msg/text/?${encodedText}`
    
    // LINEで共有を開く
    window.open(lineShareUrl, '_blank')
  }

  const maxPartyCount = calculateMaxPartyCount()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ポップアップ */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">滞在率の設定が必要です</h3>
            </div>
            <p className="text-gray-700 mb-6">{popupMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                了解
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>← 戻る</span>
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900">精算計算</h1>
        </div>
        <div className="text-sm text-gray-500">
          {isLoggedIn ? 'ログイン済み' : 'ログイン不要'}
        </div>
      </div>

      {/* 基本情報表示 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              飲み会のタイトル
            </label>
            <p className="text-gray-900">{event.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開催日
            </label>
            <p className="text-gray-900">{event.eventDate}</p>
          </div>
        </div>
      </div>

      {/* 参加者情報 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">参加者 ({event.participants.length}名)</h2>
        <div className="space-y-3">
          {event.participants.map((participant) => (
            <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{participant.nickname}</h3>
                  <p className="text-sm text-gray-600">
                    {participant.gender === 'male' ? '男性' : participant.gender === 'female' ? '女性' : '未設定'} / 
                    {participant.role === 'senior' ? '先輩' : participant.role === 'junior' ? '後輩' : 'フラット'}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  滞在率: {participant.stayRange.firstParty > 0 ? '1次会' : ''}
                  {participant.stayRange.secondParty > 0 ? (participant.stayRange.firstParty > 0 ? ', 2次会' : '2次会') : ''}
                  {participant.stayRange.thirdParty > 0 ? (participant.stayRange.firstParty > 0 || participant.stayRange.secondParty > 0 ? ', 3次会' : '3次会') : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 会場情報 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">会場 ({event.venues.length}箇所)</h2>
        
        {/* 滞在率情報表示 */}
        {maxPartyCount > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              📊 参加者の滞在率から計算すると、<strong>{maxPartyCount}次会</strong>まで設定されています。
            </p>
          </div>
        )}

        <div className="space-y-3">
          {event.venues.map((venue) => (
            <div key={venue.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{venue.venueOrder}次会: {venue.name}</h3>
                  <p className="text-sm text-gray-600">支払者: {venue.paidBy}さん</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-blue-600">
                    ¥{typeof venue.totalAmount === 'string' ? parseInt(venue.totalAmount) || 0 : venue.totalAmount}円
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 精算実行ボタン */}
      {!calculationResult && (
        <div className="flex justify-center mb-8">
          <button
            onClick={calculateSettlement}
            disabled={event.venues.length === 0}
            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            精算を実行
          </button>
        </div>
      )}

      {/* 精算結果 */}
      {calculationResult && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">精算結果</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🍺 {calculationResult.event.title}
            </h3>
            <p className="text-blue-800">
              📅 開催日: {calculationResult.event.eventDate}
            </p>
            <p className="text-blue-800 font-semibold">
              💰 総額: ¥{calculationResult.totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h4 className="text-lg font-medium text-gray-900">参加者別精算額</h4>
            {calculationResult.participants.map((participant: any) => (
              <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{participant.nickname}</h5>
                    <p className="text-sm text-gray-600">
                      係数: {participant.multiplier.toFixed(2)}倍
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ¥{participant.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={copyResult}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="w-5 h-5" />
              <span>結果をコピー</span>
            </button>
            <button
              onClick={downloadResult}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>ファイルをダウンロード</span>
            </button>
            <button
              onClick={shareToLine}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>LINEで共有</span>
            </button>
          </div>

          {isLoggedIn && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                💾 この精算結果は自動的に保存されました
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
