import { calculateSettlement } from '@/lib/utils'
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { rules } = body

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

    // デフォルトの傾斜ルール（設定が送信されていない場合）
    const defaultRules = {
      genderMultiplier: { male: 1.0, female: 1.0, unspecified: 1.0 },
      roleMultiplier: { senior: 1.2, junior: 0.8, flat: 1.0 },
      stayRangeMultiplier: { first: 1.0, second: 1.0, third: 1.0 },
    }

    // 精算計算
    const calculations = calculateSettlement(
      event.participants,
      event.venues,
      rules || defaultRules
    )

    // 精算結果をデータベースに保存
    const settlements = await Promise.all(
      calculations.map(async (calculation) => {
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
      settlements,
      calculations,
    })
  } catch (error) {
    console.error('Error calculating settlements:', error)
    return NextResponse.json(
      { error: 'Failed to calculate settlements' },
      { status: 500 }
    )
  }
} 
