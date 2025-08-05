'use client'

import ClientLogger from '@/components/ClientLogger'
import { CreateEventData, CreateParticipantData, CreateVenueData } from '@/types'
import { Edit, Plus, Save, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// localStorageのキー
const FORM_DATA_KEY = 'newEventFormData'

export default function NewEventPage() {
  console.log('🚀 [NewEventPage] 新しい飲み会作成ページがマウントされました')
  const router = useRouter()
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    eventDate: '',
    participants: [],
    venues: [],
  })

  const [currentParticipant, setCurrentParticipant] = useState<CreateParticipantData>({
    nickname: '',
    gender: 'unspecified',
    role: 'flat',
    stayRange: {
      firstParty: 1.0,
      secondParty: 0.0,
      thirdParty: 0.0,
    },
  })

  const [currentVenue, setCurrentVenue] = useState<CreateVenueData>({
    venueOrder: 1,
    name: '',
    totalAmount: 0,
    paidBy: '',
  })

  // 現在の入力データも保存・復元するためのキー
  const CURRENT_PARTICIPANT_KEY = 'newEventCurrentParticipant'
  const CURRENT_VENUE_KEY = 'newEventCurrentVenue'

  // 編集状態管理
  const [editingParticipantIndex, setEditingParticipantIndex] = useState<number | null>(null)
  const [editingVenueIndex, setEditingVenueIndex] = useState<number | null>(null)
  const [editParticipantData, setEditParticipantData] = useState<CreateParticipantData | null>(null)
  const [editVenueData, setEditVenueData] = useState<CreateVenueData | null>(null)

  // ページマウント時にlocalStorageからデータを復元
  useEffect(() => {
    console.log('📥 [NewEventPage] localStorageからデータを復元中...')
    
    // 設定画面から戻ってきたかどうかをチェック
    const fromSettings = localStorage.getItem('fromNewEventPage') === 'true'
    if (fromSettings) {
      console.log('🔄 [NewEventPage] 設定画面から戻ってきました')
      // フラグは設定画面でクリアされるため、ここでは削除しない
    }
    
    // フォームデータの復元
    const savedData = localStorage.getItem(FORM_DATA_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        console.log('✅ [NewEventPage] 保存されたデータを復元:', parsedData)
        console.log('📊 [NewEventPage] 復元された参加者数:', parsedData.participants?.length || 0)
        console.log('🏪 [NewEventPage] 復元されたお店数:', parsedData.venues?.length || 0)
        setFormData(parsedData)
      } catch (error) {
        console.error('❌ [NewEventPage] データ復元エラー:', error)
        localStorage.removeItem(FORM_DATA_KEY)
      }
    } else {
      console.log('ℹ️ [NewEventPage] 保存されたデータが見つかりません')
    }

    // 現在の参加者入力データの復元
    const savedCurrentParticipant = localStorage.getItem(CURRENT_PARTICIPANT_KEY)
    if (savedCurrentParticipant) {
      try {
        const parsedParticipant = JSON.parse(savedCurrentParticipant)
        console.log('✅ [NewEventPage] 現在の参加者入力データを復元:', parsedParticipant)
        setCurrentParticipant(parsedParticipant)
      } catch (error) {
        console.error('❌ [NewEventPage] 参加者入力データ復元エラー:', error)
        localStorage.removeItem(CURRENT_PARTICIPANT_KEY)
      }
    }

    // 現在のお店入力データの復元
    const savedCurrentVenue = localStorage.getItem(CURRENT_VENUE_KEY)
    if (savedCurrentVenue) {
      try {
        const parsedVenue = JSON.parse(savedCurrentVenue)
        console.log('✅ [NewEventPage] 現在のお店入力データを復元:', parsedVenue)
        setCurrentVenue(parsedVenue)
      } catch (error) {
        console.error('❌ [NewEventPage] お店入力データ復元エラー:', error)
        localStorage.removeItem(CURRENT_VENUE_KEY)
      }
    }

    // データ復元完了後にフラグを設定
    setTimeout(() => {
      setIsDataRestored(true)
      console.log('✅ [NewEventPage] データ復元完了、保存機能を有効化')
    }, 100)
  }, [])

  // データ復元フラグ
  const [isDataRestored, setIsDataRestored] = useState(false)

  // フォームデータが変更されるたびにlocalStorageに保存（データ復元後のみ）
  useEffect(() => {
    if (isDataRestored) {
      console.log('💾 [NewEventPage] フォームデータをlocalStorageに保存中...')
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData))
    }
  }, [formData, isDataRestored])

  // 現在の参加者入力データが変更されるたびにlocalStorageに保存（データ復元後のみ）
  useEffect(() => {
    if (isDataRestored) {
      console.log('💾 [NewEventPage] 現在の参加者入力データをlocalStorageに保存中...')
      localStorage.setItem(CURRENT_PARTICIPANT_KEY, JSON.stringify(currentParticipant))
    }
  }, [currentParticipant, isDataRestored])

  // 現在のお店入力データが変更されるたびにlocalStorageに保存（データ復元後のみ）
  useEffect(() => {
    if (isDataRestored) {
      console.log('💾 [NewEventPage] 現在のお店入力データをlocalStorageに保存中...')
      localStorage.setItem(CURRENT_VENUE_KEY, JSON.stringify(currentVenue))
    }
  }, [currentVenue, isDataRestored])

  // ページを離れる際のデータ管理
  useEffect(() => {
    const handleBeforeUnload = () => {
      // ブラウザを閉じる時のみデータをクリア
      console.log('🧹 [NewEventPage] ブラウザを閉じるため、データをクリア')
      localStorage.removeItem(FORM_DATA_KEY)
      localStorage.removeItem(CURRENT_PARTICIPANT_KEY)
      localStorage.removeItem(CURRENT_VENUE_KEY)
    }

    // ページが非表示になった時の処理
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 設定画面への移動かどうかをチェック
        const isNavigatingToSettings = localStorage.getItem('navigatingToSettings') === 'true'
        const fromNewEventPage = localStorage.getItem('fromNewEventPage') === 'true'
        
        console.log('👁️ [NewEventPage] ページ非表示:', { isNavigatingToSettings, fromNewEventPage })
        
        if (isNavigatingToSettings || fromNewEventPage) {
          console.log('💾 [NewEventPage] 設定画面への移動のため、データを保持')
          // 設定画面への移動であることを示すフラグを設定
          localStorage.setItem('fromNewEventPage', 'true')
        } else {
          console.log('🧹 [NewEventPage] その他の理由でページ非表示、データをクリア')
          localStorage.removeItem(FORM_DATA_KEY)
          localStorage.removeItem(CURRENT_PARTICIPANT_KEY)
          localStorage.removeItem(CURRENT_VENUE_KEY)
        }
      } else if (document.visibilityState === 'visible') {
        // ページが再表示された時
        const fromNewEventPage = localStorage.getItem('fromNewEventPage') === 'true'
        if (fromNewEventPage) {
          console.log('🔄 [NewEventPage] 設定画面から戻ってきました')
          // fromNewEventPageフラグは設定画面で管理するため、ここでは削除しない
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // フォームデータをクリアする関数
  const clearFormData = () => {
    console.log('🧹 [NewEventPage] フォームデータをクリア')
    localStorage.removeItem(FORM_DATA_KEY)
    localStorage.removeItem(CURRENT_PARTICIPANT_KEY)
    localStorage.removeItem(CURRENT_VENUE_KEY)
    setFormData({
      title: '',
      eventDate: '',
      participants: [],
      venues: [],
    })
    setCurrentParticipant({
      nickname: '',
      gender: 'unspecified',
      role: 'flat',
      stayRange: {
        firstParty: 1.0,
        secondParty: 0.0,
        thirdParty: 0.0,
      },
    })
    setCurrentVenue({
      venueOrder: 1,
      name: '',
      totalAmount: 0,
      paidBy: '',
    })
    // データ復元フラグをリセット
    setIsDataRestored(false)
    setTimeout(() => {
      setIsDataRestored(true)
    }, 100)
  }

  const addParticipant = () => {
    console.log('👥 [addParticipant] 参加者追加開始')
    console.log('📝 [addParticipant] 入力データ:', currentParticipant)
    
    if (currentParticipant.nickname.trim()) {
      console.log('✅ [addParticipant] バリデーション成功')
      console.log('📊 [addParticipant] 追加前の参加者数:', formData.participants.length)
      
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, { ...currentParticipant }],
      }))
      
      console.log('✅ [addParticipant] 参加者追加完了')
      setCurrentParticipant({
        nickname: '',
        gender: 'unspecified',
        role: 'flat',
        stayRange: {
          firstParty: 1.0,
          secondParty: 0.0,
          thirdParty: 0.0,
        },
      })
    } else {
      console.log('❌ [addParticipant] バリデーションエラー: ニックネームが空')
    }
  }

  const removeParticipant = (index: number) => {
    console.log('🗑️ [removeParticipant] 参加者削除開始 - index:', index)
    console.log('📊 [removeParticipant] 削除前の参加者数:', formData.participants.length)
    
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index),
    }))
    
    console.log('✅ [removeParticipant] 参加者削除完了')
  }

  const addVenue = () => {
    console.log('➕ [addVenue] お店追加開始')
    console.log('📝 [addVenue] 入力データ:', currentVenue)
    console.log('🏪 [addVenue] 現在のお店一覧:', formData.venues)
    console.log('🔢 [addVenue] 現在のvenueOrder一覧:', formData.venues.map((v, i) => ({ index: i, venueOrder: v.venueOrder, name: v.name })))
    
    if (currentVenue.name.trim() && currentVenue.totalAmount > 0 && currentVenue.paidBy.trim()) {
      console.log('✅ [addVenue] バリデーション成功')
      
      // venueOrderの計算ロジックを詳細にログ出力
      const currentVenueOrder = currentVenue.venueOrder
      console.log('🔢 [addVenue] 現在のvenueOrder:', currentVenueOrder)
      console.log('📊 [addVenue] 既存のお店数:', formData.venues.length)
      
      // 既存のお店のvenueOrderを確認
      const existingVenueOrders = formData.venues.map(v => v.venueOrder).sort((a, b) => a - b)
      console.log('🔢 [addVenue] 既存のvenueOrder一覧（ソート済み）:', existingVenueOrders)
      
      // 連続性チェック
      const expectedOrder = existingVenueOrders.length + 1
      console.log('🔍 [addVenue] 期待されるvenueOrder:', expectedOrder)
      console.log('🔍 [addVenue] 実際のvenueOrder:', currentVenueOrder)
      console.log('🔍 [addVenue] venueOrderの整合性:', expectedOrder === currentVenueOrder ? '✅ 一致' : '❌ 不一致')
      
      setFormData(prev => ({
        ...prev,
        venues: [...prev.venues, { ...currentVenue }],
      }))
      
      console.log('✅ [addVenue] お店追加完了')
      console.log('📊 [addVenue] 追加後のvenueOrder一覧:', [...formData.venues, currentVenue].map((v, i) => ({ index: i, venueOrder: v.venueOrder, name: v.name })))
      
      setCurrentVenue(prev => {
        const nextVenueOrder = prev.venueOrder + 1
        console.log('🔢 [addVenue] 次のvenueOrderを設定:', nextVenueOrder)
        return {
          venueOrder: nextVenueOrder,
          name: '',
          totalAmount: 0,
          paidBy: '',
        }
      })
    } else {
      console.log('❌ [addVenue] バリデーションエラー:')
      console.log('  - 店名:', currentVenue.name.trim() ? '✅' : '❌ 空')
      console.log('  - 総金額:', currentVenue.totalAmount > 0 ? '✅' : '❌ 0以下')
      console.log('  - 支払者:', currentVenue.paidBy.trim() ? '✅' : '❌ 空')
    }
  }

  const removeVenue = (index: number) => {
    console.log('🗑️ [removeVenue] お店削除開始 - index:', index)
    console.log('🏪 [removeVenue] 削除前のお店一覧:', formData.venues.map((v, i) => ({ index: i, venueOrder: v.venueOrder, name: v.name })))
    
    const venueToRemove = formData.venues[index]
    console.log('🗑️ [removeVenue] 削除対象のお店:', venueToRemove)
    
    setFormData(prev => ({
      ...prev,
      venues: prev.venues.filter((_, i) => i !== index),
    }))
    
    console.log('✅ [removeVenue] お店削除完了')
    console.log('📊 [removeVenue] 削除後のvenueOrder一覧:', formData.venues.filter((_, i) => i !== index).map((v, i) => ({ index: i, venueOrder: v.venueOrder, name: v.name })))
    
    // 削除後のvenueOrderの再計算が必要かチェック
    const remainingVenues = formData.venues.filter((_, i) => i !== index)
    const remainingOrders = remainingVenues.map(v => v.venueOrder).sort((a, b) => a - b)
    console.log('🔍 [removeVenue] 削除後のvenueOrder連続性チェック:', remainingOrders.map((order, i) => ({ expected: i + 1, actual: order, isCorrect: order === i + 1 })))
  }

  // 参加者編集機能
  const startEditParticipant = (index: number) => {
    console.log('✏️ [startEditParticipant] 参加者編集開始 - index:', index)
    setEditingParticipantIndex(index)
    setEditParticipantData({ ...formData.participants[index] })
  }

  const cancelEditParticipant = () => {
    console.log('❌ [cancelEditParticipant] 参加者編集キャンセル')
    setEditingParticipantIndex(null)
    setEditParticipantData(null)
  }

  const saveParticipant = () => {
    console.log('💾 [saveParticipant] 参加者保存開始')
    if (editParticipantData && editingParticipantIndex !== null) {
      console.log('📝 [saveParticipant] 保存データ:', editParticipantData)
      
      setFormData(prev => ({
        ...prev,
        participants: prev.participants.map((participant, index) =>
          index === editingParticipantIndex ? editParticipantData : participant
        ),
      }))
      
      console.log('✅ [saveParticipant] 参加者保存完了')
      setEditingParticipantIndex(null)
      setEditParticipantData(null)
    }
  }

  // お店編集機能
  const startEditVenue = (index: number) => {
    console.log('✏️ [startEditVenue] お店編集開始 - index:', index)
    setEditingVenueIndex(index)
    setEditVenueData({ ...formData.venues[index] })
  }

  const cancelEditVenue = () => {
    console.log('❌ [cancelEditVenue] お店編集キャンセル')
    setEditingVenueIndex(null)
    setEditVenueData(null)
  }

  const saveVenue = () => {
    console.log('💾 [saveVenue] お店保存開始')
    if (editVenueData && editingVenueIndex !== null) {
      console.log('📝 [saveVenue] 保存データ:', editVenueData)
      console.log('🔢 [saveVenue] 編集前のvenueOrder:', formData.venues[editingVenueIndex].venueOrder)
      console.log('🔢 [saveVenue] 編集後のvenueOrder:', editVenueData.venueOrder)
      
      setFormData(prev => ({
        ...prev,
        venues: prev.venues.map((venue, index) =>
          index === editingVenueIndex ? editVenueData : venue
        ),
      }))
      
      console.log('✅ [saveVenue] お店保存完了')
      setEditingVenueIndex(null)
      setEditVenueData(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 [handleSubmit] 飲み会作成開始')
    console.log('📊 [handleSubmit] 送信データ:', formData)
    console.log('👥 [handleSubmit] 参加者数:', formData.participants.length)
    console.log('🏪 [handleSubmit] お店数:', formData.venues.length)
    console.log('🔢 [handleSubmit] venueOrder一覧:', formData.venues.map((v, i) => ({ index: i, venueOrder: v.venueOrder, name: v.name })))
    
    // venueOrderの連続性チェック
    const venueOrders = formData.venues.map(v => v.venueOrder).sort((a, b) => a - b)
    console.log('🔍 [handleSubmit] venueOrderの連続性チェック:', venueOrders.map((order, i) => ({ expected: i + 1, actual: order, isCorrect: order === i + 1 })))
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('📥 [handleSubmit] APIレスポンス:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [handleSubmit] 飲み会作成成功:', data)
        console.log('🔢 [handleSubmit] 作成されたvenueOrder一覧:', data.venues?.map((v: any, i: number) => ({ index: i, venueOrder: v.venueOrder, name: v.name })) || [])
        
        // 飲み会作成成功時にフォームデータをクリア
        clearFormData()
        // データ復元フラグをリセット
        setIsDataRestored(false)
        
        router.push(`/events/${data.id}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [handleSubmit] APIエラー:', errorData)
        alert('飲み会の作成に失敗しました')
      }
    } catch (error) {
      console.error('❌ [handleSubmit] 例外エラー:', error)
      alert('エラーが発生しました')
    }
  }

  return (
    <>
      <ClientLogger componentName="NewEventPage" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">新しい飲み会を作成</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              💾 データは自動保存されています
            </div>
            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              ⚙️ 設定画面で傾斜を調整できます
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本情報 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  飲み会名
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="飲み会名を入力"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開催日
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* 参加者 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">参加者</h2>
            
            {/* 参加者追加フォーム */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">新しい参加者を追加</h3>
              <div className="grid md:grid-cols-4 gap-3 mb-3">
                <input
                  type="text"
                  value={currentParticipant.nickname}
                  onChange={(e) => setCurrentParticipant(prev => ({ ...prev, nickname: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ニックネーム"
                />
                <select
                  value={currentParticipant.gender}
                  onChange={(e) => setCurrentParticipant(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unspecified">性別未設定</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
                <select
                  value={currentParticipant.role}
                  onChange={(e) => setCurrentParticipant(prev => ({ ...prev, role: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="flat">フラット</option>
                  <option value="senior">先輩</option>
                  <option value="junior">後輩</option>
                </select>
                <button
                  type="button"
                  onClick={addParticipant}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  追加
                </button>
              </div>
              {/* 滞在時間設定 */}
              <div className="bg-white p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">滞在時間設定</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">1次会参加率</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={currentParticipant.stayRange.firstParty}
                      onChange={(e) => setCurrentParticipant(prev => ({
                        ...prev,
                        stayRange: { ...prev.stayRange, firstParty: parseFloat(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">1.0=全時間参加, 0.0=参加なし</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">2次会参加率</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={currentParticipant.stayRange.secondParty}
                      onChange={(e) => setCurrentParticipant(prev => ({
                        ...prev,
                        stayRange: { ...prev.stayRange, secondParty: parseFloat(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">1.0=全時間参加, 0.0=参加なし</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">3次会参加率</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={currentParticipant.stayRange.thirdParty}
                      onChange={(e) => setCurrentParticipant(prev => ({
                        ...prev,
                        stayRange: { ...prev.stayRange, thirdParty: parseFloat(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">1.0=全時間参加, 0.0=参加なし</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 参加者一覧 */}
            <div className="space-y-3">
              {formData.participants.map((participant, index) => (
                <div key={index}>
                  {editingParticipantIndex === index ? (
                    // 編集フォーム
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                                              <div className="grid md:grid-cols-4 gap-3 mb-3">
                          <input
                            type="text"
                            value={editParticipantData?.nickname || ''}
                            onChange={(e) => setEditParticipantData(prev => prev ? {...prev, nickname: e.target.value} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ニックネーム"
                          />
                          <select
                            value={editParticipantData?.gender || 'unspecified'}
                            onChange={(e) => setEditParticipantData(prev => prev ? {...prev, gender: e.target.value as any} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="unspecified">性別未設定</option>
                            <option value="male">男性</option>
                            <option value="female">女性</option>
                          </select>
                          <select
                            value={editParticipantData?.role || 'flat'}
                            onChange={(e) => setEditParticipantData(prev => prev ? {...prev, role: e.target.value as any} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="flat">フラット</option>
                            <option value="senior">先輩</option>
                            <option value="junior">後輩</option>
                          </select>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={saveParticipant}
                              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              <Save className="w-4 h-4 inline mr-1" />
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditParticipant}
                              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                              <X className="w-4 h-4 inline mr-1" />
                              キャンセル
                            </button>
                          </div>
                        </div>
                        {/* 滞在時間設定 */}
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">滞在時間設定</h4>
                          <div className="grid md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">1次会参加率</label>
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">1.0=全時間参加, 0.0=参加なし</p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">2次会参加率</label>
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">1.0=全時間参加, 0.0=参加なし</p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">3次会参加率</label>
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">1.0=全時間参加, 0.0=参加なし</p>
                            </div>
                          </div>
                        </div>
                    </div>
                  ) : (
                    // 表示モード
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{participant.nickname}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {participant.gender === 'male' ? '男性' : participant.gender === 'female' ? '女性' : '未設定'} / 
                            {participant.role === 'senior' ? '先輩' : participant.role === 'junior' ? '後輩' : 'フラット'}
                          </span>
                          <button
                            type="button"
                            onClick={() => startEditParticipant(index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeParticipant(index)}
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
                      <div className="text-xs text-gray-400 mt-1">
                        参加: {participant.stayRange.firstParty > 0 ? '1次会' : ''}
                        {participant.stayRange.secondParty > 0 ? (participant.stayRange.firstParty > 0 ? ', 2次会' : '2次会') : ''}
                        {participant.stayRange.thirdParty > 0 ? (participant.stayRange.firstParty > 0 || participant.stayRange.secondParty > 0 ? ', 3次会' : '3次会') : ''}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* お店 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">お店</h2>
            
            {/* お店追加フォーム */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">新しいお店を追加</h3>
              <div className="grid md:grid-cols-5 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">次会</label>
                  <input
                    type="number"
                    value={currentVenue.venueOrder}
                    onChange={(e) => setCurrentVenue(prev => ({ ...prev, venueOrder: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">店名</label>
                  <input
                    type="text"
                    value={currentVenue.name}
                    onChange={(e) => setCurrentVenue(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="店名"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">総金額</label>
                  <input
                    type="number"
                    value={currentVenue.totalAmount === 0 ? '' : currentVenue.totalAmount}
                    onChange={(e) => setCurrentVenue(prev => ({ ...prev, totalAmount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="総金額"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">支払者</label>
                  <select
                    value={currentVenue.paidBy}
                    onChange={(e) => setCurrentVenue(prev => ({ ...prev, paidBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">支払者を選択</option>
                    {formData.participants.map((participant) => (
                      <option key={participant.nickname} value={participant.nickname}>
                        {participant.nickname}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addVenue}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    追加
                  </button>
                </div>
              </div>
            </div>

            {/* お店一覧 */}
            <div className="space-y-3">
              {formData.venues.map((venue, index) => (
                <div key={index}>
                  {editingVenueIndex === index ? (
                    // 編集フォーム
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="grid md:grid-cols-5 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">次会</label>
                          <input
                            type="number"
                            value={editVenueData?.venueOrder || 1}
                            onChange={(e) => setEditVenueData(prev => prev ? {...prev, venueOrder: parseInt(e.target.value) || 1} : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">店名</label>
                          <input
                            type="text"
                            value={editVenueData?.name || ''}
                            onChange={(e) => setEditVenueData(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="店名"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">総金額</label>
                          <input
                            type="number"
                            value={editVenueData?.totalAmount === 0 ? '' : editVenueData?.totalAmount || ''}
                            onChange={(e) => setEditVenueData(prev => prev ? {...prev, totalAmount: parseInt(e.target.value) || 0} : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="総金額"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">支払者</label>
                          <select
                            value={editVenueData?.paidBy || ''}
                            onChange={(e) => setEditVenueData(prev => prev ? {...prev, paidBy: e.target.value} : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">支払者を選択</option>
                            {formData.participants.map((participant) => (
                              <option key={participant.nickname} value={participant.nickname}>
                                {participant.nickname}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <div className="flex space-x-2 w-full">
                            <button
                              type="button"
                              onClick={saveVenue}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              <Save className="w-4 h-4 inline mr-1" />
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditVenue}
                              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                              <X className="w-4 h-4 inline mr-1" />
                              キャンセル
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 表示モード
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{venue.venueOrder}次会: {venue.name}</span>
                          <span className="text-lg font-semibold text-blue-600">
                            ¥{venue.totalAmount.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">支払者: {venue.paidBy}さん</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => startEditVenue(index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVenue(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={clearFormData}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              データをクリア
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              飲み会を作成
            </button>
          </div>
        </form>
      </div>
    </>
  )
} 
