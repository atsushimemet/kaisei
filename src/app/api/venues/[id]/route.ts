import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, googleMapsUrl, totalAmount, paidBy, venueOrder } = body

    // データ検証
    if (!name?.trim()) {
      return NextResponse.json(
        { error: '店名は必須です' },
        { status: 400 }
      )
    }

    if (!paidBy?.trim()) {
      return NextResponse.json(
        { error: '支払者は必須です' },
        { status: 400 }
      )
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: '総金額は0より大きい値である必要があります' },
        { status: 400 }
      )
    }

    const venueId = parseInt(params.id)
    if (isNaN(venueId)) {
      return NextResponse.json(
        { error: '無効なお店IDです' },
        { status: 400 }
      )
    }

    const updateData: any = {
      name: name.trim(),
      googleMapsUrl: googleMapsUrl?.trim() || null,
      totalAmount: parseInt(totalAmount),
      paidBy: paidBy.trim(),
    }

    // venueOrderが提供されている場合は追加
    if (venueOrder !== undefined) {
      updateData.venueOrder = parseInt(venueOrder)
    }

    const venue = await prisma.venue.update({
      where: {
        id: venueId,
      },
      data: updateData,
    })

    return NextResponse.json(venue)
  } catch (error) {
    console.error('Error updating venue:', error)
    return NextResponse.json(
      { error: 'Failed to update venue' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.venue.delete({
      where: {
        id: parseInt(params.id),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting venue:', error)
    return NextResponse.json(
      { error: 'Failed to delete venue' },
      { status: 500 }
    )
  }
}
