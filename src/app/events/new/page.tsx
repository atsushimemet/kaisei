'use client'

import { CreateEventData, CreateParticipantData, CreateVenueData } from '@/types'
import { Plus, Save, Trash2 } from 'lucide-react'
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
      firstParty: true,
      secondParty: false,
      thirdParty: false,
    },
  })

  const [currentVenue, setCurrentVenue] = useState<CreateVenueData>({
    venueOrder: 1,
    name: '',
    totalAmount: 0,
    paymentMethod: '',
  })

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
          firstParty: true,
          secondParty: false,
          thirdParty: false,
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
    if (currentVenue.name.trim() && currentVenue.totalAmount > 0) {
      setFormData(prev => ({
        ...prev,
        venues: [...prev.venues, { ...currentVenue }],
      }))
      setCurrentVenue(prev => ({
        venueOrder: prev.venueOrder + 1,
        name: '',
        totalAmount: 0,
        paymentMethod: '',
      }))
    }
  }

  const removeVenue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      venues: prev.venues.filter((_, i) => i !== index),
    }))
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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card': return 'クレジットカード'
      case 'cash': return '現金'
      case 'paypay': return 'PayPay'
      case 'quicpay': return 'QUICPay'
      case 'other': return 'その他'
      default: return method
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
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{participant.nickname}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({participant.gender === 'male' ? '男性' : participant.gender === 'female' ? '女性' : '未設定'} / 
                        {participant.role === 'senior' ? '先輩' : participant.role === 'junior' ? '後輩' : 'フラット'})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 参加者追加フォーム */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">参加者を追加</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addParticipant}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  追加
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
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{venue.venueOrder}次会: {venue.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ¥{venue.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVenue(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* お店追加フォーム */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">お店を追加</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                  支払方法
                </label>
                <select
                  value={currentVenue.paymentMethod}
                  onChange={(e) => setCurrentVenue(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">選択してください</option>
                  <option value="credit_card">クレジットカード</option>
                  <option value="cash">現金</option>
                  <option value="paypay">PayPay</option>
                  <option value="quicpay">QUICPay</option>
                  <option value="other">その他</option>
                </select>
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
