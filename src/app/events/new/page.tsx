'use client'

import { CreateEventData, CreateParticipantData, CreateVenueData } from '@/types'
import { Plus, Save, Trash2, Edit, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewEventPage() {
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

  // 編集状態管理
  const [editingParticipantIndex, setEditingParticipantIndex] = useState<number | null>(null)
  const [editingVenueIndex, setEditingVenueIndex] = useState<number | null>(null)
  const [editParticipantData, setEditParticipantData] = useState<CreateParticipantData | null>(null)
  const [editVenueData, setEditVenueData] = useState<CreateVenueData | null>(null)

  const addParticipant = () => {
    if (currentParticipant.nickname.trim()) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, { ...currentParticipant }],
      }))
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
    }
  }

  const removeParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index),
    }))
  }

  const addVenue = () => {
    if (currentVenue.name.trim() && currentVenue.totalAmount > 0 && currentVenue.paidBy.trim()) {
      setFormData(prev => ({
        ...prev,
        venues: [...prev.venues, { ...currentVenue }],
      }))
      setCurrentVenue(prev => ({
        venueOrder: prev.venueOrder + 1,
        name: '',
        totalAmount: 0,
        paidBy: '',
      }))
    }
  }

  const removeVenue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      venues: prev.venues.filter((_, i) => i !== index),
    }))
  }

  // 参加者編集機能
  const startEditParticipant = (index: number) => {
    setEditingParticipantIndex(index)
    setEditParticipantData({ ...formData.participants[index] })
  }

  const cancelEditParticipant = () => {
    setEditingParticipantIndex(null)
    setEditParticipantData(null)
  }

  const saveParticipant = () => {
    if (editParticipantData && editingParticipantIndex !== null) {
      setFormData(prev => ({
        ...prev,
        participants: prev.participants.map((participant, index) =>
          index === editingParticipantIndex ? { ...editParticipantData } : participant
        )
      }))
      cancelEditParticipant()
    }
  }

  // お店編集機能
  const startEditVenue = (index: number) => {
    setEditingVenueIndex(index)
    setEditVenueData({ ...formData.venues[index] })
  }

  const cancelEditVenue = () => {
    setEditingVenueIndex(null)
    setEditVenueData(null)
  }

  const saveVenue = () => {
    if (editVenueData && editingVenueIndex !== null) {
      setFormData(prev => ({
        ...prev,
        venues: prev.venues.map((venue, index) =>
          index === editingVenueIndex ? { ...editVenueData } : venue
        )
      }))
      cancelEditVenue()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.participants.length === 0) {
      alert('参加者を追加してください')
      return
    }

    if (formData.venues.length === 0) {
      alert('お店を追加してください')
      return
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/events/${result.id}`)
      } else {
        alert('エラーが発生しました')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert('エラーが発生しました')
    }
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">新しい飲み会を作成</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本情報 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                飲み会のタイトル
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="例: 8月の飲み会"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* 参加者 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">参加者</h2>
          
          {/* 参加者リスト */}
          {formData.participants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">追加済み参加者</h3>
              <div className="space-y-2">
                {formData.participants.map((participant, index) => (
                  <div key={index}>
                    {editingParticipantIndex === index ? (
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
                            type="button"
                            onClick={saveParticipant}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            <Save className="w-3 h-3 inline mr-1" />
                            保存
                          </button>
                          <button
                            type="button"
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 参加者追加フォーム */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">参加者を追加</h3>
            <div className="space-y-4">
              {/* 基本情報 */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ニックネーム
                  </label>
                  <input
                    type="text"
                    value={currentParticipant.nickname}
                    onChange={(e) => setCurrentParticipant(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="例: 田中さん"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性別
                  </label>
                  <select
                    value={currentParticipant.gender}
                    onChange={(e) => setCurrentParticipant(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                    value={currentParticipant.role}
                    onChange={(e) => setCurrentParticipant(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="flat">フラット</option>
                    <option value="senior">先輩</option>
                    <option value="junior">後輩</option>
                  </select>
                </div>
              </div>

              {/* 滞在時間設定 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">滞在時間設定</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1次会参加率
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={currentParticipant.stayRange.firstParty}
                      onChange={(e) => setCurrentParticipant(prev => ({
                        ...prev,
                        stayRange: {
                          ...prev.stayRange,
                          firstParty: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">1.0=全時間参加, 0.0=参加なし</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2次会参加率
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={currentParticipant.stayRange.secondParty}
                      onChange={(e) => setCurrentParticipant(prev => ({
                        ...prev,
                        stayRange: {
                          ...prev.stayRange,
                          secondParty: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">1.0=全時間参加, 0.0=参加なし</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3次会参加率
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={currentParticipant.stayRange.thirdParty}
                      onChange={(e) => setCurrentParticipant(prev => ({
                        ...prev,
                        stayRange: {
                          ...prev.stayRange,
                          thirdParty: parseFloat(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">1.0=全時間参加, 0.0=参加なし</p>
                  </div>
                </div>
              </div>

              {/* 追加ボタン */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addParticipant}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  参加者を追加
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* お店 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">お店</h2>
          
          {/* お店リスト */}
          {formData.venues.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">追加済みお店</h3>
              <div className="space-y-2">
                {formData.venues.map((venue, index) => (
                  <div key={index}>
                    {editingVenueIndex === index ? (
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
                            {formData.participants.map((participant, pIndex) => (
                              <option key={pIndex} value={participant.nickname}>
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
                            type="button"
                            onClick={saveVenue}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            <Save className="w-3 h-3 inline mr-1" />
                            保存
                          </button>
                          <button
                            type="button"
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
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <span className="font-medium">{venue.venueOrder}次会: {venue.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ¥{venue.totalAmount.toLocaleString()} ({venue.paidBy}が支払い)
                          </span>
                          {venue.googleMapsUrl && (
                            <div className="text-xs text-blue-600 mt-1">
                              <a href={venue.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                Google Mapsで開く
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* お店追加フォーム */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">お店を追加</h3>
            <div className="space-y-4 mb-4">
              <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  店名
                </label>
                <input
                  type="text"
                  value={currentVenue.name}
                  onChange={(e) => setCurrentVenue(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例: 焼肉ホルモン"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  総金額
                </label>
                <input
                  type="number"
                  value={currentVenue.totalAmount}
                  onChange={(e) => setCurrentVenue(prev => ({ ...prev, totalAmount: parseInt(e.target.value) || 0 }))}
                  placeholder="例: 18000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  支払者
                </label>
                <select
                  value={currentVenue.paidBy}
                  onChange={(e) => setCurrentVenue(prev => ({ ...prev, paidBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">選択してください</option>
                  {formData.participants.map((participant, index) => (
                    <option key={index} value={participant.nickname}>
                      {participant.nickname}
                    </option>
                  ))}
                </select>
              </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Maps URL (任意)
                  </label>
                  <input
                    type="url"
                    value={currentVenue.googleMapsUrl || ''}
                    onChange={(e) => setCurrentVenue(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addVenue}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    追加
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5 inline mr-2" />
            飲み会を作成
          </button>
        </div>
      </form>
    </div>
  )
} 
