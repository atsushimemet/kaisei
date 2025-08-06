import { getPrisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nickname, gender, role, stayRange } = body
    const eventId = parseInt(params.id)

    const prisma = getPrisma()
    const participant = await prisma.participants.create({
      data: {
        event_id: eventId,
        nickname,
        gender,
        role,
        stay_range: JSON.stringify(stayRange),
        created_at: new Date(),
      },
    })

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error creating participant:', error)
    return NextResponse.json(
      { error: 'Failed to create participant' },
      { status: 500 }
    )
  }
}