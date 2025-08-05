import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nickname, gender, role, stayRange } = body
    const eventId = parseInt(params.id)

    const participant = await prisma.participant.create({
      data: {
        eventId,
        nickname,
        gender,
        role,
        stayRange,
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