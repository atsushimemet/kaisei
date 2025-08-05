import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッションを取得してユーザーIDを確認
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // 会場がログインユーザーのイベントに属しているかチェック
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: { event: true }
    })

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      )
    }

    if (venue.event.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
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

    const updatedVenue = await prisma.venue.update({
      where: {
        id: venueId,
      },
      data: updateData,
    })

    return NextResponse.json(updatedVenue)
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
    // セッションを取得してユーザーIDを確認
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🗑️ [DELETE /venues] お店削除開始')
    const venueId = parseInt(params.id)
    if (isNaN(venueId)) {
      console.log('❌ [DELETE /venues] 無効なvenueId:', params.id)
      return NextResponse.json(
        { error: '無効なお店IDです' },
        { status: 400 }
      )
    }

    console.log('🔍 [DELETE /venues] 削除対象venueId:', venueId)

    // 削除するvenueの情報を取得
    const venueToDelete = await prisma.venue.findUnique({
      where: { id: venueId },
      include: { event: true }
    })

    if (!venueToDelete) {
      console.log('❌ [DELETE /venues] venueが見つかりません:', venueId)
      return NextResponse.json(
        { error: 'お店が見つかりません' },
        { status: 404 }
      )
    }

    // 会場がログインユーザーのイベントに属しているかチェック
    if (venueToDelete.event.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    console.log('📊 [DELETE /venues] 削除対象venue:', venueToDelete)

    // venueを削除
    await prisma.venue.delete({
      where: { id: venueId },
    })

    console.log('✅ [DELETE /venues] venue削除完了')

    // 同じイベントの残りのvenueのvenueOrderを再整理
    const remainingVenues = await prisma.venue.findMany({
      where: { eventId: venueToDelete.eventId },
      orderBy: { venueOrder: 'asc' },
      select: { id: true, venueOrder: true }
    })

    console.log('📊 [DELETE /venues] 削除後の残りvenue:', remainingVenues)

    // venueOrderを1から連番で再割り当て
    for (let i = 0; i < remainingVenues.length; i++) {
      const venue = remainingVenues[i]
      if (venue.venueOrder !== i + 1) {
        console.log('🔄 [DELETE /venues] venueOrder更新:', { id: venue.id, oldOrder: venue.venueOrder, newOrder: i + 1 })
        await prisma.venue.update({
          where: { id: venue.id },
          data: { venueOrder: i + 1 }
        })
      }
    }

    console.log('✅ [DELETE /venues] venueOrder再整理完了')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [DELETE /venues] エラー:', error)
    return NextResponse.json(
      { error: 'Failed to delete venue' },
      { status: 500 }
    )
  }
}
