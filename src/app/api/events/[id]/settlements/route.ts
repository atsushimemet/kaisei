import { calculateFullSettlement } from '@/lib/settlement'
import { getPrisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // URLのクエリパラメータから設定を取得（オプション）
    const { searchParams } = new URL(request.url)
    const configParam = searchParams.get('config')
    let config = null
    
    if (configParam) {
      try {
        config = JSON.parse(decodeURIComponent(configParam))
      } catch (error) {
        console.error('Error parsing config from query params:', error)
      }
    }

    const prisma = getPrisma()
    const event = await prisma.events.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        participants: true,
        venues: {
          orderBy: {
            venue_order: 'asc',
          },
        },
        settlements: {
          include: {
            participants: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // 精算計算を実行（設定がある場合は使用）
    const settlementData = calculateFullSettlement(event as any, config)

    return NextResponse.json(settlementData)
  } catch (error) {
    console.error('Error calculating settlements:', error)
    return NextResponse.json(
      { error: 'Failed to calculate settlements' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { config } = body

    const prisma = getPrisma()
    const event = await prisma.events.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        participants: true,
        venues: {
          orderBy: {
            venue_order: 'asc',
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // 精算計算を実行（クライアントから送信された設定を使用）
    const settlementData = calculateFullSettlement(event as any, config)

    // 精算結果をデータベースに保存（既存の精算データを削除してから新規作成）
    await prisma.settlements.deleteMany({
      where: { event_id: event.id },
    })

    const dbSettlements = await Promise.all(
      settlementData.settlements.map(async (calculation) => {
        return await prisma.settlements.create({
          data: {
            event_id: event.id,
            participant_id: calculation.participantId,
            amount: calculation.amount,
            status: 'PENDING',
            created_at: new Date(),
            updated_at: new Date(),
          },
          include: {
            participants: true,
          },
        })
      })
    )

    return NextResponse.json({
      event,
      dbSettlements,
      ...settlementData,
    })
  } catch (error) {
    console.error('Error calculating settlements:', error)
    return NextResponse.json(
      { error: 'Failed to calculate settlements' },
      { status: 500 }
    )
  }
} 
