export interface Event {
  id: number
  title: string
  eventDate: Date
  createdAt: Date
  updatedAt: Date
  participants: Participant[]
  venues: Venue[]
  settlements: Settlement[]
}

export interface Participant {
  id: number
  eventId: number
  nickname: string
  gender: 'male' | 'female' | 'unspecified'
  role: 'senior' | 'junior' | 'flat'
  stayRange: StayRange
  createdAt: Date
  settlements: Settlement[]
}

export interface Venue {
  id: number
  eventId: number
  venueOrder: number
  name: string
  googleMapsUrl?: string
  totalAmount: number
  paidBy: string // 支払者のニックネーム
  createdAt: Date
}

export interface Settlement {
  id: number
  eventId: number
  participantId: number
  amount: number
  paymentMethod?: string
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
  participant: Participant
}

export interface StayRange {
  firstParty: number
  secondParty: number
  thirdParty: number
}

export interface CreateEventData {
  title: string
  eventDate: string
  participants: CreateParticipantData[]
  venues: CreateVenueData[]
}

export interface CreateParticipantData {
  nickname: string
  gender: 'male' | 'female' | 'unspecified'
  role: 'senior' | 'junior' | 'flat'
  stayRange: StayRange
}

export interface CreateVenueData {
  venueOrder: number
  name: string
  googleMapsUrl?: string
  totalAmount: number
  paidBy: string // 支払者のニックネーム
}

export interface SettlementCalculation {
  participantId: number
  nickname: string
  amount: number
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

export interface PaymentSummary {
  participantId: number
  nickname: string
  totalPaid: number // 実際に支払った金額
  totalOwed: number // 支払い義務のある金額
  balance: number // 差額（正の値：お金をもらう、負の値：支払う）
}

export interface SettlementTransfer {
  from: string // 支払う人のニックネーム
  to: string // 受け取る人のニックネーム
  amount: number // 精算金額
} 
