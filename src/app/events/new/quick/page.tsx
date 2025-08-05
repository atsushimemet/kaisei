'use client'

import { DEFAULT_SETTLEMENT_RULES, SettlementRules } from '@/types'
import { ArrowLeft, Copy, Download, HelpCircle, Plus, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface QuickParticipant {
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

interface QuickVenue {
  id: string
  venueOrder: number
  name: string
  googleMapsUrl?: string
  totalAmount: number | string // 0から空文字に変更
  paidBy: string
}

interface QuickEvent {
  title: string
  eventDate: string
  participants: QuickParticipant[]
  venues: QuickVenue[]
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

export default function QuickEventPage() {
  const router = useRouter()
  const [event, setEvent] = useState<QuickEvent>({
    title: '',
    eventDate: new Date().toISOString().split('T')[0],
    participants: [],
    venues: []
  })
  const [rules, setRules] = useState<SettlementRules>(DEFAULT_SETTLEMENT_RULES)
  const [currentStep, setCurrentStep] = useState<'basic' | 'participants' | 'venues' | 'calculation'>('basic')
  const [calculationResult, setCalculationResult] = useState<any>(null)

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

  const addParticipant = () => {
    const newParticipant: QuickParticipant = {
      id: Date.now().toString(),
      nickname: '',
      gender: 'unspecified',
      role: 'flat',
      stayRange: {
        firstParty: 1,
        secondParty: 1,
        thirdParty: 1
      }
    }
    setEvent(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }))
  }

  const updateParticipant = (id: string, field: keyof QuickParticipant, value: any) => {
    setEvent(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }))
  }

  const removeParticipant = (id: string) => {
    setEvent(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }))
  }

  const addVenue = () => {
    const newVenue: QuickVenue = {
      id: Date.now().toString(),
      venueOrder: event.venues.length + 1,
      name: '',
      totalAmount: '', // 0から空文字に変更
      paidBy: ''
    }
    setEvent(prev => ({
      ...prev,
      venues: [...prev.venues, newVenue]
    }))
  }

  const updateVenue = (id: string, field: keyof QuickVenue, value: any) => {
    setEvent(prev => ({
      ...prev,
      venues: prev.venues.map(v => 
        v.id === id ? { ...v, [field]: value } : v
      )
    }))
  }

  const removeVenue = (id: string) => {
    setEvent(prev => ({
      ...prev,
      venues: prev.venues.filter(v => v.id !== id)
    }))
  }

  const calculateSettlement = () => {
    if (event.participants.length === 0 || event.venues.length === 0) {
      alert('参加者と会場を入力してください')
      return
    }

    // 精算計算ロジック（簡略版）
    const totalAmount = event.venues.reduce((sum, venue) => {
      const amount = typeof venue.totalAmount === 'string' ? parseInt(venue.totalAmount) || 0 : venue.totalAmount
      return sum + amount
    }, 0)
    const participants = event.participants.map(p => {
      const multiplier = 
        rules.genderMultiplier[p.gender] * 
        rules.roleMultiplier[p.role] * 
        (p.stayRange.firstParty + p.stayRange.secondParty + p.stayRange.thirdParty) / 3
      
      return {
        ...p,
        multiplier,
        amount: Math.round((totalAmount / event.participants.reduce((sum, p2) => {
          const m2 = rules.genderMultiplier[p2.gender] * 
                    rules.roleMultiplier[p2.role] * 
                    (p2.stayRange.firstParty + p2.stayRange.secondParty + p2.stayRange.thirdParty) / 3
          return sum + m2
        }, 0)) * multiplier)
      }
    })

    setCalculationResult({
      event,
      participants,
      totalAmount,
      rules
    })
    setCurrentStep('calculation')
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

    navigator.clipboard.writeText(resultText)
    alert('精算結果をコピーしました！')
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

  const saveToLocalStorage = () => {
    if (!calculationResult) return

    const savedEvents = JSON.parse(localStorage.getItem('quickEvents') || '[]')
    const newEvent = {
      ...calculationResult,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    savedEvents.push(newEvent)
    localStorage.setItem('quickEvents', JSON.stringify(savedEvents))
    alert('精算結果をローカルに保存しました！')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>ホームに戻る</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">クイック精算</h1>
        </div>
        <div className="text-sm text-gray-500">
          ログイン不要で精算を実行
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { key: 'basic', label: '基本情報', icon: '📝' },
            { key: 'participants', label: '参加者', icon: '👥' },
            { key: 'venues', label: '会場', icon: '🏪' },
            { key: 'calculation', label: '精算結果', icon: '💰' }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep === step.key 
                  ? 'bg-blue-600 text-white' 
                  : index < ['basic', 'participants', 'venues', 'calculation'].indexOf(currentStep)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <span className="text-sm">{step.icon}</span>
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === step.key ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < 3 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 基本情報 */}
      {currentStep === 'basic' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                飲み会のタイトル
              </label>
              <input
                type="text"
                value={event.title}
                onChange={(e) => setEvent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 新年会"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開催日
              </label>
              <input
                type="date"
                value={event.eventDate}
                onChange={(e) => setEvent(prev => ({ ...prev, eventDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setCurrentStep('participants')}
              disabled={!event.title}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ: 参加者を追加
            </button>
          </div>
        </div>
      )}

      {/* 参加者 */}
      {currentStep === 'participants' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">参加者</h2>
          <div className="space-y-4">
            {event.participants.map((participant) => (
              <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ニックネーム
                    </label>
                    <input
                      type="text"
                      value={participant.nickname}
                      onChange={(e) => updateParticipant(participant.id, 'nickname', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 田中"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      性別
                    </label>
                    <select
                      value={participant.gender}
                      onChange={(e) => updateParticipant(participant.id, 'gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unspecified">未設定</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      役割
                    </label>
                    <select
                      value={participant.role}
                      onChange={(e) => updateParticipant(participant.id, 'role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="flat">フラット</option>
                      <option value="senior">先輩</option>
                      <option value="junior">後輩</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        ⚪︎次回滞在率
                      </label>
                      <Tooltip content="⚪︎次回にどれだけいたかを設定するコンポーネントです。1.0は全時間参加、0.0は参加なしを意味します。">
                        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={participant.stayRange.firstParty}
                        onChange={(e) => updateParticipant(participant.id, 'stayRange', {
                          ...participant.stayRange,
                          firstParty: parseFloat(e.target.value)
                        })}
                        className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1次会"
                      />
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={participant.stayRange.secondParty}
                        onChange={(e) => updateParticipant(participant.id, 'stayRange', {
                          ...participant.stayRange,
                          secondParty: parseFloat(e.target.value)
                        })}
                        className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2次会"
                      />
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={participant.stayRange.thirdParty}
                        onChange={(e) => updateParticipant(participant.id, 'stayRange', {
                          ...participant.stayRange,
                          thirdParty: parseFloat(e.target.value)
                        })}
                        className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="3次会"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => removeParticipant(participant.id)}
                    className="px-3 py-1 text-red-600 hover:text-red-800 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addParticipant}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              参加者を追加
            </button>
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep('basic')}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              戻る
            </button>
            <button
              onClick={() => setCurrentStep('venues')}
              disabled={event.participants.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ: 会場を追加
            </button>
          </div>
        </div>
      )}

      {/* 会場 */}
      {currentStep === 'venues' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">会場</h2>
          <div className="space-y-4">
            {event.venues.map((venue) => (
              <div key={venue.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会場名
                    </label>
                    <input
                      type="text"
                      value={venue.name}
                      onChange={(e) => updateVenue(venue.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 居酒屋 〇〇"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      支払者
                    </label>
                    <select
                      value={venue.paidBy}
                      onChange={(e) => updateVenue(venue.id, 'paidBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">選択してください</option>
                      {event.participants.map((p) => (
                        <option key={p.id} value={p.nickname}>
                          {p.nickname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      金額
                    </label>
                    <input
                      type="number"
                      value={venue.totalAmount === '' ? '' : venue.totalAmount}
                      onChange={(e) => {
                        const value = e.target.value
                        updateVenue(venue.id, 'totalAmount', value === '' ? '' : parseInt(value) || 0)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      順番
                    </label>
                    <input
                      type="number"
                      value={venue.venueOrder}
                      onChange={(e) => updateVenue(venue.id, 'venueOrder', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => removeVenue(venue.id)}
                    className="px-3 py-1 text-red-600 hover:text-red-800 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addVenue}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              会場を追加
            </button>
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep('participants')}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              戻る
            </button>
            <button
              onClick={calculateSettlement}
              disabled={event.venues.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              精算を実行
            </button>
          </div>
        </div>
      )}

      {/* 精算結果 */}
      {currentStep === 'calculation' && calculationResult && (
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

          <div className="space-y-4">
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

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
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
              onClick={saveToLocalStorage}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>ローカルに保存</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ホームに戻る</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
} 
