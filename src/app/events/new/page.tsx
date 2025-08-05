'use client'

import ClientLogger from '@/components/ClientLogger'
import SettlementForm from '@/components/SettlementForm'
import { CreateEventData } from '@/types'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewEventPage() {
  console.log('🚀 [NewEventPage] 新しい飲み会作成ページがマウントされました')
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCalculate = async (eventData: any) => {
    console.log('🚀 [handleCalculate] 飲み会作成開始')
    console.log('📊 [handleCalculate] 送信データ:', eventData)
    console.log('👥 [handleCalculate] 参加者数:', eventData.participants.length)
    console.log('🏪 [handleCalculate] お店数:', eventData.venues.length)
    
    if (!session) {
      console.log('❌ [handleCalculate] セッションがありません')
      alert('ログインが必要です')
      return
    }

    setIsSubmitting(true)

    try {
      // データ形式を変換
      const createEventData: CreateEventData = {
        title: eventData.title,
        eventDate: eventData.eventDate,
        participants: eventData.participants.map((p: any) => ({
          nickname: p.nickname,
          gender: p.gender,
          role: p.role,
          stayRange: p.stayRange
        })),
        venues: eventData.venues.map((v: any) => ({
          venueOrder: v.venueOrder,
          name: v.name,
          totalAmount: typeof v.totalAmount === 'string' ? parseInt(v.totalAmount) || 0 : v.totalAmount,
          paidBy: v.paidBy
        }))
      }

      console.log('📤 [handleCalculate] APIに送信するデータ:', createEventData)

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createEventData),
      })

      console.log('📥 [handleCalculate] APIレスポンス:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [handleCalculate] 飲み会作成成功:', data)
        console.log('🔢 [handleCalculate] 作成されたvenueOrder一覧:', data.venues?.map((v: any, i: number) => ({ index: i, venueOrder: v.venueOrder, name: v.name })) || [])
        
        router.push(`/events/${data.id}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [handleCalculate] APIエラー:', errorData)
        alert('飲み会の作成に失敗しました')
      }
    } catch (error) {
      console.error('❌ [handleCalculate] 例外エラー:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push('/events')
  }

  return (
    <>
      <ClientLogger componentName="NewEventPage" />
      <SettlementForm
        onCalculate={handleCalculate}
        onBack={handleBack}
        isLoggedIn={!!session}
      />
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>飲み会を作成中...</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
