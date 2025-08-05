'use client'

import { Event, SettlementCalculation, PaymentSummary, SettlementTransfer, Participant, Venue } from '@/types'
import { Calculator, Copy, MessageSquare, ArrowRight, Edit, Plus, Save, X, Trash2 } from 'lucide-react'
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
  
  // 編集状態管理
  const [editingParticipant, setEditingParticipant] = useState<number | null>(null)
  const [editingVenue, setEditingVenue] = useState<number | null>(null)
  const [editParticipantData, setEditParticipantData] = useState<Participant | null>(null)
  const [editVenueData, setEditVenueData] = useState<Venue | null>(null)
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [showAddVenue, setShowAddVenue] = useState(false)
  const [newParticipant, setNewParticipant] = useState({
    nickname: '',
    gender: 'unspecified' as const,
    role: 'flat' as const,
    stayRange: { firstParty: 1.0, secondParty: 0.0, thirdParty: 0.0 }
  })
  const [newVenue, setNewVenue] = useState({
    venueOrder: 1,
    name: '',
    googleMapsUrl: '',
    totalAmount: 0,
    paidBy: ''
  })

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
        console.log('Raw savedConfig from localStorage:', savedConfig)
        if (savedConfig) {
          config = JSON.parse(savedConfig)
          console.log('Parsed config:', config)
        } else {
          console.log('No config found in localStorage')
        }
      } catch (error) {
        console.error('Error loading settlement config:', error)
      }

      console.log('Sending config to API:', config)

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
        console.log('API response:', data)
        setSettlements(data.settlements)
        setPaymentSummaries(data.paymentSummaries)
        setTransfers(data.transfers)
      } else {
        console.error('API response error:', response.status, response.statusText)
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

  // 参加者編集機能
  const startEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant.id)
    setEditParticipantData({ ...participant })
  }

  const cancelEditParticipant = () => {
    setEditingParticipant(null)
    setEditParticipantData(null)
  }

  const saveParticipant = async () => {
    if (!editParticipantData || !editingParticipant) return

    try {
      const response = await fetch(`/api/participants/${editingParticipant}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: editParticipantData.nickname,
          gender: editParticipantData.gender,
          role: editParticipantData.role,
          stayRange: editParticipantData.stayRange,
        }),
      })

      if (response.ok) {
        await fetchEvent()
        setEditingParticipant(null)
        setEditParticipantData(null)
      } else {
        alert('参加者の更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating participant:', error)
      alert('エラーが発生しました')
    }
  }

  const deleteParticipant = async (participantId: number) => {
    if (!confirm('この参加者を削除しますか？')) return

    try {
      const response = await fetch(`/api/participants/${participantId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEvent()
      } else {
        alert('参加者の削除に失敗しました')
      }
    } catch (error) {
      console.error('Error deleting participant:', error)
      alert('エラーが発生しました')
    }
  }

  const addParticipant = async () => {
    if (!newParticipant.nickname.trim()) return

    try {
      const response = await fetch(`/api/events/${params.id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParticipant),
      })

      if (response.ok) {
        await fetchEvent()
        setShowAddParticipant(false)
        setNewParticipant({
          nickname: '',
          gender: 'unspecified',
          role: 'flat',
          stayRange: { firstParty: 1.0, secondParty: 0.0, thirdParty: 0.0 }
        })
      } else {
        alert('参加者の追加に失敗しました')
      }
    } catch (error) {
      console.error('Error adding participant:', error)
      alert('エラーが発生しました')
    }
  }

  // お店編集機能
  const startEditVenue = (venue: Venue) => {
    setEditingVenue(venue.id)
    setEditVenueData({ ...venue })
  }

  const cancelEditVenue = () => {
    setEditingVenue(null)
    setEditVenueData(null)
  }

  const saveVenue = async () => {
    if (!editVenueData || !editingVenue) return

    try {
      const response = await fetch(`/api/venues/${editingVenue}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editVenueData.name,
          googleMapsUrl: editVenueData.googleMapsUrl,
          totalAmount: editVenueData.totalAmount,
          paidBy: editVenueData.paidBy,
        }),
      })

      if (response.ok) {
        await fetchEvent()
        setEditingVenue(null)
        setEditVenueData(null)
      } else {
        alert('お店情報の更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating venue:', error)
      alert('エラーが発生しました')
    }
  }

  const deleteVenue = async (venueId: number) => {
    if (!confirm('このお店を削除しますか？')) return

    try {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEvent()
      } else {
        alert('お店の削除に失敗しました')
      }
    } catch (error) {
      console.error('Error deleting venue:', error)
      alert('エラーが発生しました')
    }
  }

  const addVenue = async () => {
    if (!newVenue.name.trim() || !newVenue.paidBy.trim() || newVenue.totalAmount <= 0) return

    try {
      const response = await fetch(`/api/events/${params.id}/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVenue),
      })

      if (response.ok) {
        await fetchEvent()
        setShowAddVenue(false)
        setNewVenue({
          venueOrder: (event?.venues.length || 0) + 1,
          name: '',
          googleMapsUrl: '',
          totalAmount: 0,
          paidBy: ''
        })
      } else {
        alert('お店の追加に失敗しました')
      }
    } catch (error) {
      console.error('Error adding venue:', error)
      alert('エラーが発生しました')
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">参加者</h2>
            <button
              onClick={() => setShowAddParticipant(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              追加
            </button>
          </div>
          
          <div className="space-y-3">
            {event.participants.map((participant) => (
              <div key={participant.id}>
                {editingParticipant === participant.id ? (
                  // 編集フォーム
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="grid md:grid-cols-3 gap-3 mb-3">
                      <input
                        type="text"
                        value={editParticipantData?.nickname || ''}
                        onChange={(e) => setEditParticipantData(prev => prev ? {...prev, nickname: e.target.value} : null)}
                        className="px-2 py-1 border rounded text-sm"
                        placeholder="ニックネーム"
                      />
                      <select
                        value={editParticipantData?.gender || 'unspecified'}
                        onChange={(e) => setEditParticipantData(prev => prev ? {...prev, gender: e.target.value as any} : null)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="unspecified">未設定</option>
                        <option value="male">男性</option>
                        <option value="female">女性</option>
                      </select>
                      <select
                        value={editParticipantData?.role || 'flat'}
                        onChange={(e) => setEditParticipantData(prev => prev ? {...prev, role: e.target.value as any} : null)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="flat">フラット</option>
                        <option value="senior">先輩</option>
                        <option value="junior">後輩</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div>
                        <label className="text-xs text-gray-600">1次会</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={editParticipantData?.stayRange.firstParty || 0}
                          onChange={(e) => setEditParticipantData(prev => prev ? {
                            ...prev,
                            stayRange: { ...prev.stayRange, firstParty: parseFloat(e.target.value) }
                          } : null)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">2次会</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={editParticipantData?.stayRange.secondParty || 0}
                          onChange={(e) => setEditParticipantData(prev => prev ? {
                            ...prev,
                            stayRange: { ...prev.stayRange, secondParty: parseFloat(e.target.value) }
                          } : null)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">3次会</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={editParticipantData?.stayRange.thirdParty || 0}
                          onChange={(e) => setEditParticipantData(prev => prev ? {
                            ...prev,
                            stayRange: { ...prev.stayRange, thirdParty: parseFloat(e.target.value) }
                          } : null)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={saveParticipant}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        <Save className="w-3 h-3 inline mr-1" />
                        保存
                      </button>
                      <button
                        onClick={cancelEditParticipant}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        <X className="w-3 h-3 inline mr-1" />
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{participant.nickname}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({participant.gender === 'male' ? '男性' : participant.gender === 'female' ? '女性' : '未設定'} / 
                        {participant.role === 'senior' ? '先輩' : participant.role === 'junior' ? '後輩' : 'フラット'})
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        参加: {participant.stayRange.firstParty > 0 ? '1次会' : ''}
                        {participant.stayRange.secondParty > 0 ? (participant.stayRange.firstParty > 0 ? ', 2次会' : '2次会') : ''}
                        {participant.stayRange.thirdParty > 0 ? (participant.stayRange.firstParty > 0 || participant.stayRange.secondParty > 0 ? ', 3次会' : '3次会') : ''}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditParticipant(participant)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteParticipant(participant.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* 参加者追加フォーム */}
          {showAddParticipant && (
            <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
              <h4 className="font-medium text-gray-900 mb-3">新しい参加者を追加</h4>
              <div className="grid md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={newParticipant.nickname}
                  onChange={(e) => setNewParticipant(prev => ({...prev, nickname: e.target.value}))}
                  className="px-2 py-1 border rounded text-sm"
                  placeholder="ニックネーム"
                />
                <select
                  value={newParticipant.gender}
                  onChange={(e) => setNewParticipant(prev => ({...prev, gender: e.target.value as any}))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="unspecified">未設定</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
                <select
                  value={newParticipant.role}
                  onChange={(e) => setNewParticipant(prev => ({...prev, role: e.target.value as any}))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="flat">フラット</option>
                  <option value="senior">先輩</option>
                  <option value="junior">後輩</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-600">1次会参加率</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={newParticipant.stayRange.firstParty}
                    onChange={(e) => setNewParticipant(prev => ({
                      ...prev,
                      stayRange: { ...prev.stayRange, firstParty: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">2次会参加率</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={newParticipant.stayRange.secondParty}
                    onChange={(e) => setNewParticipant(prev => ({
                      ...prev,
                      stayRange: { ...prev.stayRange, secondParty: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">3次会参加率</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={newParticipant.stayRange.thirdParty}
                    onChange={(e) => setNewParticipant(prev => ({
                      ...prev,
                      stayRange: { ...prev.stayRange, thirdParty: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={addParticipant}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  追加
                </button>
                <button
                  onClick={() => setShowAddParticipant(false)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  <X className="w-3 h-3 inline mr-1" />
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        {/* お店情報 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">お店</h2>
            <button
              onClick={() => {
                setNewVenue(prev => ({
                  ...prev,
                  venueOrder: (event.venues.length || 0) + 1
                }))
                setShowAddVenue(true)
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              追加
            </button>
          </div>
          
          <div className="space-y-3">
            {event.venues.map((venue) => (
              <div key={venue.id}>
                {editingVenue === venue.id ? (
                  // 編集フォーム
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-600">店名</label>
                        <input
                          type="text"
                          value={editVenueData?.name || ''}
                          onChange={(e) => setEditVenueData(prev => prev ? {...prev, name: e.target.value} : null)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="店名"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">総金額</label>
                        <input
                          type="number"
                          value={editVenueData?.totalAmount || 0}
                          onChange={(e) => setEditVenueData(prev => prev ? {...prev, totalAmount: parseInt(e.target.value) || 0} : null)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="総金額"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs text-gray-600">支払者</label>
                      <select
                        value={editVenueData?.paidBy || ''}
                        onChange={(e) => setEditVenueData(prev => prev ? {...prev, paidBy: e.target.value} : null)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="">選択してください</option>
                        {event.participants.map((participant) => (
                          <option key={participant.id} value={participant.nickname}>
                            {participant.nickname}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs text-gray-600">Google Maps URL (任意)</label>
                      <input
                        type="url"
                        value={editVenueData?.googleMapsUrl || ''}
                        onChange={(e) => setEditVenueData(prev => prev ? {...prev, googleMapsUrl: e.target.value} : null)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={saveVenue}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        <Save className="w-3 h-3 inline mr-1" />
                        保存
                      </button>
                      <button
                        onClick={cancelEditVenue}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        <X className="w-3 h-3 inline mr-1" />
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{venue.venueOrder}次会: {venue.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-blue-600">
                          ¥{formatCurrency(venue.totalAmount)}
                        </span>
                        <button
                          onClick={() => startEditVenue(venue)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteVenue(venue.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">支払者: {venue.paidBy}さん</p>
                    {venue.googleMapsUrl && (
                      <a
                        href={venue.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Google Mapsで開く
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* お店追加フォーム */}
          {showAddVenue && (
            <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
              <h4 className="font-medium text-gray-900 mb-3">新しいお店を追加</h4>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-600">店名</label>
                  <input
                    type="text"
                    value={newVenue.name}
                    onChange={(e) => setNewVenue(prev => ({...prev, name: e.target.value}))}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="店名"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">総金額</label>
                  <input
                    type="number"
                    value={newVenue.totalAmount}
                    onChange={(e) => setNewVenue(prev => ({...prev, totalAmount: parseInt(e.target.value) || 0}))}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="総金額"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-600">支払者</label>
                <select
                  value={newVenue.paidBy}
                  onChange={(e) => setNewVenue(prev => ({...prev, paidBy: e.target.value}))}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="">選択してください</option>
                  {event.participants.map((participant) => (
                    <option key={participant.id} value={participant.nickname}>
                      {participant.nickname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-600">Google Maps URL (任意)</label>
                <input
                  type="url"
                  value={newVenue.googleMapsUrl}
                  onChange={(e) => setNewVenue(prev => ({...prev, googleMapsUrl: e.target.value}))}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={addVenue}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  追加
                </button>
                <button
                  onClick={() => setShowAddVenue(false)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  <X className="w-3 h-3 inline mr-1" />
                  キャンセル
                </button>
              </div>
            </div>
          )}
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
                        <div className="grid md:grid-cols-2 gap-3">
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
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div className="space-y-2">
                        <div className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                          デフォルト設定を使用
                        </div>
                        <div className="text-xs text-gray-600">
                          性別: 男性1.2倍, 女性0.8倍, 未設定1.0倍<br/>
                          役割: 先輩1.3倍, 後輩0.7倍, フラット1.0倍
                        </div>
                      </div>
                    )
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
