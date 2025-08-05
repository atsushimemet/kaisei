'use client'

import ClientLogger from '@/components/ClientLogger'
import { Event, Participant, PaymentSummary, SettlementCalculation, SettlementTransfer, Venue } from '@/types'
import { ArrowRight, Calculator, Copy, Edit, MessageSquare, Plus, Save, Trash2, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EventDetailPage() {
  console.log('🚀 [EventDetailPage] コンポーネントがマウントされました')
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
    console.log('🔄 [useEffect] fetchEventが呼び出されました')
    fetchEvent()
  }, [])

  const fetchEvent = async () => {
    try {
      console.log('🔄 [fetchEvent] イベントデータを取得中...')
      const response = await fetch(`/api/events/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📊 [fetchEvent] 取得したイベントデータ:', data)
        console.log('🏪 [fetchEvent] お店データ:', data.venues)
        console.log('🏪 [fetchEvent] お店のvenueOrder一覧:', data.venues.map((v: any) => ({ id: v.id, name: v.name, venueOrder: v.venueOrder })))
        
        // venueOrderの詳細分析
        const venueOrders = data.venues.map((v: any) => v.venueOrder).sort((a: number, b: number) => a - b)
        console.log('🔢 [fetchEvent] venueOrderのソート結果:', venueOrders)
        console.log('🔍 [fetchEvent] venueOrderの連続性チェック:', venueOrders.map((order: number, index: number) => ({ expected: index + 1, actual: order, isCorrect: order === index + 1 })))
        
        setEvent(data)
      }
    } catch (error) {
      console.error('❌ [fetchEvent] エラー:', error)
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
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString()
  }

  const generateSettlementMessage = (summary: PaymentSummary, transfers: SettlementTransfer[]) => {
    let message = `${summary.nickname}さんの精算結果\n\n`
    message += `支払い総額: ¥${formatCurrency(summary.totalPaid)}\n`
    message += `負担総額: ¥${formatCurrency(summary.totalOwed)}\n`
    message += `差額: ¥${formatCurrency(summary.balance)}\n\n`

    if (transfers.length > 0) {
      message += '精算方法:\n'
      transfers.forEach((transfer, index) => {
        message += `${index + 1}. ${transfer.from} → ${transfer.to}: ¥${formatCurrency(transfer.amount)}\n`
      })
    } else {
      message += '精算は不要です。'
    }

    return message
  }

  const startEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant.id)
    setEditParticipantData({ ...participant })
  }

  const cancelEditParticipant = () => {
    setEditingParticipant(null)
    setEditParticipantData(null)
  }

  const saveParticipant = async () => {
    if (!editParticipantData) return

    try {
      const response = await fetch(`/api/participants/${editParticipantData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editParticipantData),
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

  const startEditVenue = (venue: Venue) => {
    setEditingVenue(venue.id)
    setEditVenueData({ ...venue })
  }

  const cancelEditVenue = () => {
    setEditingVenue(null)
    setEditVenueData(null)
  }

  const saveVenue = async () => {
    if (!editVenueData) return

    try {
      const response = await fetch(`/api/venues/${editVenueData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editVenueData),
      })

      if (response.ok) {
        await fetchEvent()
        setEditingVenue(null)
        setEditVenueData(null)
      } else {
        alert('お店の更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating venue:', error)
      alert('エラーが発生しました')
    }
  }

  const deleteVenue = async (venueId: number) => {
    console.log('🗑️ [deleteVenue] お店削除開始 - venueId:', venueId)
    
    if (!confirm('このお店を削除しますか？')) {
      console.log('❌ [deleteVenue] ユーザーがキャンセル')
      return
    }

    try {
      console.log('🏪 [deleteVenue] 削除前のお店一覧:', event?.venues.map((v: any) => ({ id: v.id, name: v.name, venueOrder: v.venueOrder })))
      
      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'DELETE',
      })

      console.log('📥 [deleteVenue] APIレスポンス:', response.status, response.statusText)

      if (response.ok) {
        console.log('✅ [deleteVenue] 削除成功')
        await fetchEvent()
        console.log('🔄 [deleteVenue] データ再取得完了')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [deleteVenue] APIエラー:', errorData)
        alert('お店の削除に失敗しました')
      }
    } catch (error) {
      console.error('❌ [deleteVenue] 例外エラー:', error)
      alert('エラーが発生しました')
    }
  }

  const addVenue = async () => {
    console.log('➕ [addVenue] お店追加開始')
    console.log('📝 [addVenue] 入力データ:', newVenue)
    
    if (!newVenue.name.trim() || !newVenue.paidBy.trim() || newVenue.totalAmount <= 0) {
      console.log('❌ [addVenue] バリデーションエラー: 必須項目が不足')
      return
    }

    try {
      // 現在表示されているお店の最大のvenueOrderを計算
      const maxVenueOrder = event?.venues && event.venues.length > 0 
        ? Math.max(...event.venues.map(v => v.venueOrder))
        : 0

      console.log('🔢 [addVenue] 計算された最大venueOrder:', maxVenueOrder)
      console.log('🏪 [addVenue] 現在のvenueOrder一覧:', event?.venues.map((v: any) => v.venueOrder) || [])

      const venueData = {
        ...newVenue,
        venueOrder: maxVenueOrder + 1
      }
      
      console.log('📤 [addVenue] APIに送信するデータ:', venueData)

      const response = await fetch(`/api/events/${params.id}/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venueData),
      })

      console.log('📥 [addVenue] APIレスポンス:', response.status, response.statusText)

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ [addVenue] API成功 - 作成されたvenue:', responseData)
        console.log('🔢 [addVenue] 割り当てられたvenueOrder:', responseData.venueOrder)
        
        await fetchEvent()
        setShowAddVenue(false)
        setNewVenue({
          venueOrder: 1,
          name: '',
          googleMapsUrl: '',
          totalAmount: 0,
          paidBy: ''
        })
        console.log('✅ [addVenue] お店追加完了')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [addVenue] APIエラー:', errorData)
        alert('お店の追加に失敗しました')
      }
    } catch (error) {
      console.error('❌ [addVenue] 例外エラー:', error)
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
    <>
      <ClientLogger componentName="EventDetailPage" />
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
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{participant.nickname}</span>
                        <div className="flex items-center space-x-2">
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
                      <p className="text-sm text-gray-500">
                        {participant.gender === 'male' ? '男性' : participant.gender === 'female' ? '女性' : '未設定'} / 
                        {participant.role === 'senior' ? '先輩' : participant.role === 'junior' ? '後輩' : 'フラット'}
                      </p>
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
                  setShowAddVenue(true)
                }}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                追加
              </button>
            </div>
            
            <div className="space-y-3">
              {(() => {
                const sortedVenues = event.venues.sort((a, b) => a.venueOrder - b.venueOrder)
                console.log('🎯 [表示] ソート後のvenue一覧:', sortedVenues.map((v: any, i: number) => ({ 
                  index: i, 
                  displayOrder: i + 1, 
                  venueOrder: v.venueOrder, 
                  name: v.name 
                })))
                return sortedVenues.map((venue, index) => (
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
                              value={editVenueData?.totalAmount === 0 ? '' : editVenueData?.totalAmount || ''}
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
                          <span className="font-medium">{index + 1}次会: {venue.name}</span>
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
                ))
              })()}
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
                      value={newVenue.totalAmount === 0 ? '' : newVenue.totalAmount}
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
                          <div className="text-xs">
                            性別・役割による調整なし（全員1.0倍）
                          </div>
                        </div>
                      )
                    }
                  })()}
                </div>
              </div>

              {/* 精算結果 */}
              <div className="space-y-6">
                {paymentSummaries.map((summary) => (
                  <div key={summary.nickname} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {summary.nickname}さんの精算結果
                      </h3>
                      <button
                        onClick={() => copyToClipboard(generateSettlementMessage(summary, transfers.filter(t => t.from === summary.nickname || t.to === summary.nickname)))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          ¥{formatCurrency(summary.totalPaid)}
                        </div>
                        <div className="text-sm text-gray-600">支払い総額</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ¥{formatCurrency(summary.totalOwed)}
                        </div>
                        <div className="text-sm text-gray-600">負担総額</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ¥{formatCurrency(summary.balance)}
                        </div>
                        <div className="text-sm text-gray-600">差額</div>
                      </div>
                    </div>

                    {summary.balance > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center text-yellow-800">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          <span className="font-medium">精算が必要です</span>
                        </div>
                                                 <div className="mt-2 text-sm text-yellow-700">
                           {summary.nickname}さんは他の参加者から精算を受け取る必要があります。
                         </div>
                       </div>
                     )}

                     {summary.balance < 0 && (
                       <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                         <div className="flex items-center text-red-800">
                           <MessageSquare className="w-4 h-4 mr-2" />
                           <span className="font-medium">精算が必要です</span>
                         </div>
                         <div className="mt-2 text-sm text-red-700">
                           {summary.nickname}さんは他の参加者に精算を支払う必要があります。
                         </div>
                       </div>
                     )}

                     {summary.balance === 0 && (
                       <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                         <div className="flex items-center text-green-800">
                           <MessageSquare className="w-4 h-4 mr-2" />
                           <span className="font-medium">精算は不要です</span>
                         </div>
                         <div className="mt-2 text-sm text-green-700">
                           {summary.nickname}さんの支払いと負担が一致しています。
                         </div>
                       </div>
                     )}
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
            </div>
          )}
        </div>
      </div>
    </>
  )
} 
