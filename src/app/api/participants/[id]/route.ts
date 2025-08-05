import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nickname, gender, role, stayRange } = body

    // データ検証
    if (!nickname?.trim()) {
      return NextResponse.json(
        { error: 'ニックネームは必須です' },
        { status: 400 }
      )
    }

    if (!['male', 'female', 'unspecified'].includes(gender)) {
      return NextResponse.json(
        { error: '無効な性別です' },
        { status: 400 }
      )
    }

    if (!['senior', 'junior', 'flat'].includes(role)) {
      return NextResponse.json(
        { error: '無効な役割です' },
        { status: 400 }
      )
    }

    if (!stayRange || typeof stayRange !== 'object') {
      return NextResponse.json(
        { error: '滞在時間情報が無効です' },
        { status: 400 }
      )
    }

    const participantId = parseInt(params.id)
    if (isNaN(participantId)) {
      return NextResponse.json(
        { error: '無効な参加者IDです' },
        { status: 400 }
      )
    }

    const participant = await prisma.participant.update({
      where: {
        id: participantId,
      },
      data: {
        nickname: nickname.trim(),
        gender,
        role,
        stayRange,
      },
    })

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error updating participant:', error)
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.participant.delete({
      where: {
        id: parseInt(params.id),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting participant:', error)
    return NextResponse.json(
      { error: 'Failed to delete participant' },
      { status: 500 }
    )
  }
}