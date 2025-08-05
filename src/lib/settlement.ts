import { Event, Participant, Venue, PaymentSummary, SettlementTransfer, SettlementCalculation, SettlementRules, DEFAULT_SETTLEMENT_RULES } from '@/types'

// ローカルストレージから設定を取得する関数
export function getSettlementConfig(): SettlementRules {
  if (typeof window === 'undefined') {
    console.log('Server-side: Using default settlement rules')
    return DEFAULT_SETTLEMENT_RULES
  }
  
  try {
    const savedConfig = localStorage.getItem('settlementRules')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      console.log('Loaded settlement config from localStorage:', parsed)
      return parsed
    } else {
      console.log('No settlement config in localStorage, using defaults')
    }
  } catch (error) {
    console.error('Error loading settlement config:', error)
  }
  
  console.log('Using default settlement rules:', DEFAULT_SETTLEMENT_RULES)
  return DEFAULT_SETTLEMENT_RULES
}

/**
 * 参加者の各会での支払い義務金額を計算
 */
export function calculateSettlements(event: Event, config?: SettlementRules): SettlementCalculation[] {
  const { participants, venues } = event
  const settlementConfig = config || getSettlementConfig()
  
  console.log('Calculating settlements with config:', settlementConfig)
  
  return participants.map(participant => {
    let totalAmount = 0
    const breakdown: SettlementCalculation['breakdown'] = []

    venues.forEach(venue => {
      const partyNumber = venue.venueOrder
      let stayRate = 0

      // 参加率を取得
      if (partyNumber === 1) stayRate = participant.stayRange.firstParty
      else if (partyNumber === 2) stayRate = participant.stayRange.secondParty  
      else if (partyNumber === 3) stayRate = participant.stayRange.thirdParty

      if (stayRate === 0) {
        // 参加していない場合はスキップ
        return
      }

      // 同じ会に参加している人数の合計参加率を計算
      const totalParticipationRate = participants.reduce((sum, p) => {
        let rate = 0
        if (partyNumber === 1) rate = p.stayRange.firstParty
        else if (partyNumber === 2) rate = p.stayRange.secondParty
        else if (partyNumber === 3) rate = p.stayRange.thirdParty

        if (rate > 0) {
          // 調整係数を適用
          const genderMultiplier = settlementConfig.genderMultiplier[p.gender] || 1.0
          const roleMultiplier = settlementConfig.roleMultiplier[p.role] || 1.0
          return sum + (rate * genderMultiplier * roleMultiplier)
        }
        return sum
      }, 0)

      // 基本金額を計算（参加率による按分）
      const baseAmount = (venue.totalAmount * stayRate) / totalParticipationRate

      // 調整係数を適用
      const genderMultiplier = settlementConfig.genderMultiplier[participant.gender] || 1.0
      const roleMultiplier = settlementConfig.roleMultiplier[participant.role] || 1.0
      
      const adjustedAmount = baseAmount * genderMultiplier * roleMultiplier

      totalAmount += adjustedAmount

      breakdown.push({
        venueId: venue.id,
        venueName: venue.name,
        baseAmount: Math.round(baseAmount),
        adjustedAmount: Math.round(adjustedAmount),
        factors: {
          stayRange: stayRate,
          gender: genderMultiplier,
          role: roleMultiplier
        }
      })
    })

    return {
      participantId: participant.id,
      nickname: participant.nickname,
      amount: Math.round(totalAmount),
      breakdown
    }
  })
}

/**
 * 支払い状況のサマリーを計算
 */
export function calculatePaymentSummary(event: Event, settlements: SettlementCalculation[]): PaymentSummary[] {
  const { participants, venues } = event

  return participants.map(participant => {
    // 実際に支払った金額を計算
    const totalPaid = venues
      .filter(venue => venue.paidBy === participant.nickname)
      .reduce((sum, venue) => sum + venue.totalAmount, 0)

    // 支払い義務のある金額を取得
    const settlement = settlements.find(s => s.participantId === participant.id)
    const totalOwed = settlement?.amount || 0

    // 差額を計算（正の値：お金をもらう、負の値：支払う）
    const balance = totalPaid - totalOwed

    return {
      participantId: participant.id,
      nickname: participant.nickname,
      totalPaid,
      totalOwed,
      balance
    }
  })
}

/**
 * 精算すべき取引を計算
 */
export function calculateSettlementTransfers(paymentSummaries: PaymentSummary[]): SettlementTransfer[] {
  const transfers: SettlementTransfer[] = []
  
  // 支払う人（balance < 0）と受け取る人（balance > 0）を分離
  const debtors = paymentSummaries.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance)
  const creditors = paymentSummaries.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance)

  // 債務者と債権者をマッチング
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]

    const debtAmount = Math.abs(debtor.balance)
    const creditAmount = creditor.balance

    const transferAmount = Math.min(debtAmount, creditAmount)

    if (transferAmount > 0) {
      transfers.push({
        from: debtor.nickname,
        to: creditor.nickname,
        amount: transferAmount
      })

      // 残高を更新
      debtor.balance += transferAmount
      creditor.balance -= transferAmount

      // 0になった方を次に進める
      if (Math.abs(debtor.balance) < 1) debtorIndex++
      if (Math.abs(creditor.balance) < 1) creditorIndex++
    } else {
      break
    }
  }

  return transfers
}

/**
 * 精算データの全体計算
 */
export function calculateFullSettlement(event: Event, config?: SettlementRules) {
  console.log('calculateFullSettlement called with config:', config)
  const settlements = calculateSettlements(event, config)
  const paymentSummaries = calculatePaymentSummary(event, settlements)
  const transfers = calculateSettlementTransfers(paymentSummaries)

  return {
    settlements,
    paymentSummaries,
    transfers
  }
}