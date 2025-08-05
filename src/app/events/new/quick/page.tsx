'use client'

import SettlementCalculator from '@/components/SettlementCalculator'
import SettlementForm from '@/components/SettlementForm'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

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

export default function QuickEventPage() {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState<'form' | 'calculation'>('form')
  const [eventData, setEventData] = useState<Event | null>(null)

  const handleCalculate = (event: Event) => {
    setEventData(event)
    setCurrentStep('calculation')
  }

  const handleBack = () => {
    setCurrentStep('form')
    setEventData(null)
  }

  const handleSave = (result: any) => {
    // ログイン済みの場合の保存処理（必要に応じて実装）
    console.log('Saving calculation result:', result)
  }

  if (currentStep === 'calculation' && eventData) {
    return (
      <SettlementCalculator
        event={eventData}
        onBack={handleBack}
        onSave={handleSave}
        isLoggedIn={!!session}
      />
    )
  }

  return (
    <SettlementForm
      onCalculate={handleCalculate}
      isLoggedIn={!!session}
    />
  )
} 
