import { calculateFullSettlement } from '@/lib/settlement'
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        participants: true,
        venues: {
          orderBy: {
            venueOrder: 'asc',
          },
        },
        settlements: {
          include: {
            participant: true,
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

    // 精算計算を実行
    const settlementData = calculateFullSettlement(event as any)

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
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        participants: true,
        venues: {
          orderBy: {
            venueOrder: 'asc',
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

    // 精算計算を実行
    const settlementData = calculateFullSettlement(event as any)

    // 精算結果をデータベースに保存（既存の精算データを削除してから新規作成）
    await prisma.settlement.deleteMany({
      where: { eventId: event.id },
    })

    const dbSettlements = await Promise.all(
      settlementData.settlements.map(async (calculation) => {
        return await prisma.settlement.create({
          data: {
            eventId: event.id,
            participantId: calculation.participantId,
            amount: calculation.amount,
            status: 'PENDING',
          },
          include: {
            participant: true,
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
