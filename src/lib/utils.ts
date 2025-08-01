import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP').format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'credit_card': return 'クレジットカード'
    case 'cash': return '現金'
    case 'paypay': return 'PayPay'
    case 'quicpay': return 'QUICPay'
    case 'other': return 'その他'
    default: return method || '未設定'
  }
}

export function calculateSettlement(
  participants: any[],
  venues: any[],
  rules: {
    genderMultiplier: { male: number; female: number; [key: string]: number }
    roleMultiplier: { senior: number; junior: number; flat: number; [key: string]: number }
    stayRangeMultiplier: { first: number; second: number; third: number }
  }
) {
  const calculations: any[] = []

  for (const participant of participants) {
    let totalAmount = 0
    const breakdown: any[] = []

    for (const venue of venues) {
      // 滞在範囲の確認
      const stayRange = participant.stayRange
      let isParticipating = false
      let stayMultiplier = 1

      switch (venue.venueOrder) {
        case 1:
          isParticipating = stayRange.firstParty
          stayMultiplier = stayRange.firstPartyPartial ? 0.7 : 1.0
          break
        case 2:
          isParticipating = stayRange.secondParty
          stayMultiplier = stayRange.secondPartyPartial ? 0.7 : 1.0
          break
        case 3:
          isParticipating = stayRange.thirdParty
          stayMultiplier = stayRange.thirdPartyPartial ? 0.7 : 1.0
          break
      }

      if (!isParticipating) continue

      // 参加者数と傾斜係数を計算
      const participatingParticipants = participants.filter(p => {
        const pStayRange = p.stayRange
        switch (venue.venueOrder) {
          case 1: return pStayRange.firstParty
          case 2: return pStayRange.secondParty
          case 3: return pStayRange.thirdParty
          default: return false
        }
      })

      const totalMultiplier = participatingParticipants.reduce((sum, p) => {
        const genderMultiplier = rules.genderMultiplier[p.gender] || 1
        const roleMultiplier = rules.roleMultiplier[p.role] || 1
        return sum + (genderMultiplier * roleMultiplier)
      }, 0)

      // この参加者の傾斜係数
      const genderMultiplier = rules.genderMultiplier[participant.gender] || 1
      const roleMultiplier = rules.roleMultiplier[participant.role] || 1
      const participantMultiplier = genderMultiplier * roleMultiplier * stayMultiplier

      // 金額計算
      const baseAmount = venue.totalAmount / totalMultiplier
      const adjustedAmount = baseAmount * participantMultiplier

      breakdown.push({
        venueId: venue.id,
        venueName: venue.name,
        baseAmount,
        adjustedAmount,
        factors: {
          stayRange: stayMultiplier,
          gender: genderMultiplier,
          role: roleMultiplier,
        },
      })

      totalAmount += adjustedAmount
    }

    calculations.push({
      participantId: participant.id,
      nickname: participant.nickname,
      amount: Math.round(totalAmount),
      breakdown,
    })
  }

  return calculations
}

export function generateSettlementMessage(
  participant: any,
  calculation: any,
  event: any
): string {
  const venues = event.venues
    .filter((v: any) => 
      calculation.breakdown.some((b: any) => b.venueId === v.id)
    )
    .sort((a: any, b: any) => a.venueOrder - b.venueOrder)

  let message = `昨日はありがとう！以下、精算金額の案内です。\n\n`

  for (const venue of venues) {
    const breakdown = calculation.breakdown.find((b: any) => b.venueId === venue.id)
    if (breakdown) {
      message += `🍺 ${venue.venueOrder}次会（${venue.name}）：¥${formatCurrency(venue.totalAmount)}\n`
    }
  }

  const totalVenueAmount = venues.reduce((sum: number, v: any) => sum + v.totalAmount, 0)
  message += `合計：¥${formatCurrency(totalVenueAmount)}\n`
  message += `→ あなたの支払額：¥${formatCurrency(calculation.amount)}\n\n`

  // デフォルトの支払い方法を設定
  message += `PayPayの場合<PayPay link>からお願いします！\n`
  message += `それ以外（手渡し、口座振り込みなど）がいい人は連絡ください！`

  return message
} 
