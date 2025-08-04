import { Event, Participant, Venue, PaymentSummary, SettlementTransfer, SettlementCalculation } from '@/types'

// 設定可能な調整係数
export const SETTLEMENT_CONFIG = {
  // 性別による調整係数
  genderMultiplier: {
    male: 1.2,     // 男性は1.2倍
    female: 0.8,   // 女性は0.8倍
    unspecified: 1.0 // 未設定は1.0倍
  },
  // 役割による調整係数
  roleMultiplier: {
    senior: 1.3,   // 先輩は1.3倍
    junior: 0.7,   // 後輩は0.7倍
    flat: 1.0      // フラットは1.0倍
  }
}

/**
 * 参加者の各会での支払い義務金額を計算
 */
export function calculateSettlements(event: Event): SettlementCalculation[] {
  const { participants, venues } = event
  
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
          const genderMultiplier = SETTLEMENT_CONFIG.genderMultiplier[p.gender] || 1.0
          const roleMultiplier = SETTLEMENT_CONFIG.roleMultiplier[p.role] || 1.0
          return sum + (rate * genderMultiplier * roleMultiplier)
        }
        return sum
      }, 0)

      // 基本金額を計算（参加率による按分）
      const baseAmount = (venue.totalAmount * stayRate) / totalParticipationRate

      // 調整係数を適用
      const genderMultiplier = SETTLEMENT_CONFIG.genderMultiplier[participant.gender] || 1.0
      const roleMultiplier = SETTLEMENT_CONFIG.roleMultiplier[participant.role] || 1.0
      
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
export function calculateFullSettlement(event: Event) {
  const settlements = calculateSettlements(event)
  const paymentSummaries = calculatePaymentSummary(event, settlements)
  const transfers = calculateSettlementTransfers(paymentSummaries)

  return {
    settlements,
    paymentSummaries,
    transfers
  }
}