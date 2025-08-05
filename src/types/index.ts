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
  gender: 'male' | 'female' | 'unspecified' | null
  role: 'senior' | 'junior' | 'flat' | null
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

export interface SettlementRules {
  genderMultiplier: {
    male: number
    female: number
    unspecified: number
  }
  roleMultiplier: {
    senior: number
    junior: number
    flat: number
  }
  stayRangeMultiplier: {
    first: number
    second: number
    third: number
  }
}

// 統一されたデフォルト設定（全員均等）
export const DEFAULT_SETTLEMENT_RULES: SettlementRules = {
  genderMultiplier: {
    male: 1.0,     // 男性は1.0倍（均等）
    female: 1.0,   // 女性は1.0倍（均等）
    unspecified: 1.0 // 未設定は1.0倍（均等）
  },
  roleMultiplier: {
    senior: 1.0,   // 先輩は1.0倍（均等）
    junior: 1.0,   // 後輩は1.0倍（均等）
    flat: 1.0      // フラットは1.0倍（均等）
  },
  stayRangeMultiplier: {
    first: 1.0,    // 1次会は1.0倍（基準）
    second: 1.0,   // 2次会は1.0倍（基準）
    third: 1.0     // 3次会は1.0倍（基準）
  }
} 
