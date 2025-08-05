import { DEFAULT_SETTLEMENT_RULES, Event, PaymentSummary, SettlementCalculation, SettlementRules, SettlementTransfer } from '@/types'

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
  
  console.log('💰 [calculateSettlements] 精算計算開始')
  console.log('📊 [calculateSettlements] 使用する設定:', settlementConfig)
  console.log('👥 [calculateSettlements] 参加者数:', participants.length)
  console.log('🏪 [calculateSettlements] お店数:', venues.length)
  
  return participants.map(participant => {
    console.log(`👤 [calculateSettlements] ${participant.nickname}さんの計算開始`)
    console.log(`📝 [calculateSettlements] ${participant.nickname}さんの参加率:`, {
      firstParty: participant.stayRange.firstParty,
      secondParty: participant.stayRange.secondParty,
      thirdParty: participant.stayRange.thirdParty
    })
    console.log(`🔢 [calculateSettlements] ${participant.nickname}さんの調整係数:`, {
      gender: participant.gender,
      genderMultiplier: settlementConfig.genderMultiplier[participant.gender],
      role: participant.role,
      roleMultiplier: settlementConfig.roleMultiplier[participant.role]
    })
    
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
        console.log(`❌ [calculateSettlements] ${participant.nickname}さんは${partyNumber}次会に参加していません`)
        return
      }

      console.log(`🏪 [calculateSettlements] ${participant.nickname}さんの${partyNumber}次会(${venue.name})の計算開始`)
      console.log(`📊 [calculateSettlements] ${partyNumber}次会の総額: ¥${venue.totalAmount}`)
      console.log(`📊 [calculateSettlements] ${participant.nickname}さんの参加率: ${stayRate}`)

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
          const adjustedRate = rate * genderMultiplier * roleMultiplier
          console.log(`📊 [calculateSettlements] ${p.nickname}さんの調整後参加率: ${rate} × ${genderMultiplier} × ${roleMultiplier} = ${adjustedRate}`)
          return sum + adjustedRate
        }
        return sum
      }, 0)

      console.log(`📊 [calculateSettlements] ${partyNumber}次会の合計調整後参加率: ${totalParticipationRate}`)

      // 基本金額を計算（参加率による按分）
      const baseAmount = (venue.totalAmount * stayRate) / totalParticipationRate
      console.log(`💰 [calculateSettlements] ${participant.nickname}さんの基本金額: (${venue.totalAmount} × ${stayRate}) ÷ ${totalParticipationRate} = ¥${baseAmount}`)

      // 調整係数を適用
      const genderMultiplier = settlementConfig.genderMultiplier[participant.gender] || 1.0
      const roleMultiplier = settlementConfig.roleMultiplier[participant.role] || 1.0
      
      const adjustedAmount = baseAmount * genderMultiplier * roleMultiplier
      console.log(`💰 [calculateSettlements] ${participant.nickname}さんの調整後金額: ${baseAmount} × ${genderMultiplier} × ${roleMultiplier} = ¥${adjustedAmount}`)

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

    console.log(`💰 [calculateSettlements] ${participant.nickname}さんの総負担額: ¥${Math.round(totalAmount)}`)
    
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

  console.log('💰 [calculatePaymentSummary] 支払いサマリー計算開始')
  console.log('💰 [calculatePaymentSummary] settlements:', settlements.map(s => ({ participantId: s.participantId, amount: s.amount })))
  console.log('💰 [calculatePaymentSummary] participants:', participants.map(p => ({ id: p.id, nickname: p.nickname })))

  return participants.map(participant => {
    // 実際に支払った金額を計算
    const paidVenues = venues.filter(venue => venue.paidBy === participant.nickname)
    const totalPaid = paidVenues.reduce((sum, venue) => sum + venue.totalAmount, 0)
    
    console.log(`💳 [calculatePaymentSummary] ${participant.nickname}さんの支払い状況:`)
    console.log(`  - 支払ったお店:`, paidVenues.map(v => `${v.name} ¥${v.totalAmount}`))
    console.log(`  - 総支払額: ¥${totalPaid}`)

    // 支払い義務のある金額を取得
    const settlement = settlements.find(s => s.participantId === participant.id)
    const totalOwed = settlement?.amount || 0
    
    console.log(`💰 [calculatePaymentSummary] ${participant.nickname}さん(ID:${participant.id})の精算検索:`)
    console.log(`  - 検索したsettlement:`, settlement)
    console.log(`  - 負担義務額: ¥${totalOwed}`)

    // 差額を計算（正の値：お金をもらう、負の値：支払う）
    const balance = totalPaid - totalOwed
    
    console.log(`  - 差額: ¥${balance} ${balance >= 0 ? '(受け取り)' : '(支払い)'}`)
    console.log(`  - 差額の詳細: 支払い¥${totalPaid} - 負担¥${totalOwed} = ¥${balance}`)

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
  
  // 元のデータをコピーして作業用の配列を作成
  const workingSummaries = paymentSummaries.map(summary => ({
    ...summary,
    balance: summary.balance // 元のbalanceを保持
  }))
  
  console.log('🔄 [calculateSettlementTransfers] 精算取引計算開始')
  console.log('📊 [calculateSettlementTransfers] 元の差額:', workingSummaries.map(s => `${s.nickname}: ¥${s.balance}`))
  
  // 支払う人（balance < 0）と受け取る人（balance > 0）を分離
  const debtors = workingSummaries.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance)
  const creditors = workingSummaries.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance)

  console.log('💸 [calculateSettlementTransfers] 債務者:', debtors.map(d => `${d.nickname}: ¥${d.balance}`))
  console.log('💰 [calculateSettlementTransfers] 債権者:', creditors.map(c => `${c.nickname}: ¥${c.balance}`))

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
      console.log(`🔄 [calculateSettlementTransfers] 精算取引: ${debtor.nickname} → ${creditor.nickname} ¥${transferAmount}`)
      
      transfers.push({
        from: debtor.nickname,
        to: creditor.nickname,
        amount: transferAmount
      })

      // 残高を更新（作業用配列のみ）
      debtor.balance += transferAmount
      creditor.balance -= transferAmount

      console.log(`📊 [calculateSettlementTransfers] 更新後: ${debtor.nickname} ¥${debtor.balance}, ${creditor.nickname} ¥${creditor.balance}`)

      // 0になった方を次に進める
      if (Math.abs(debtor.balance) < 1) debtorIndex++
      if (Math.abs(creditor.balance) < 1) creditorIndex++
    } else {
      break
    }
  }

  console.log('✅ [calculateSettlementTransfers] 精算取引計算完了')
  console.log('📋 [calculateSettlementTransfers] 生成された取引:', transfers)

  return transfers
}

/**
 * 精算データの全体計算
 */
export function calculateFullSettlement(event: Event, config?: SettlementRules) {
  console.log('🚀 [calculateFullSettlement] 全体精算計算開始')
  console.log('📊 [calculateFullSettlement] 使用する設定:', config || 'デフォルト設定')
  
  const settlements = calculateSettlements(event, config)
  console.log('✅ [calculateFullSettlement] 精算計算完了')
  
  const paymentSummaries = calculatePaymentSummary(event, settlements)
  console.log('✅ [calculateFullSettlement] 支払いサマリー計算完了')
  
  const transfers = calculateSettlementTransfers(paymentSummaries)
  console.log('✅ [calculateFullSettlement] 精算取引計算完了')
  
  console.log('🎯 [calculateFullSettlement] 最終結果:')
  paymentSummaries.forEach(summary => {
    console.log(`  - ${summary.nickname}さん: 支払い¥${summary.totalPaid} / 負担¥${summary.totalOwed} / 差額¥${summary.balance}`)
  })

  return {
    settlements,
    paymentSummaries,
    transfers
  }
}
