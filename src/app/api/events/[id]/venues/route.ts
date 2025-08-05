import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🏪 [POST /venues] お店作成開始')
    const body = await request.json()
    const { name, googleMapsUrl, totalAmount, paidBy, venueOrder } = body
    const eventId = parseInt(params.id)
    
    console.log('📝 [POST /venues] リクエストデータ:', { eventId, name, googleMapsUrl, totalAmount, paidBy, venueOrder })
    console.log('🔍 [POST /venues] venueOrderが送信されているか:', venueOrder !== undefined)

    // 現在のvenueOrderを昇順で取得
    const existingVenues = await prisma.venue.findMany({
      where: { eventId },
      orderBy: { venueOrder: 'asc' },
      select: { venueOrder: true }
    })

    console.log('📊 [POST /venues] 既存のvenueOrder一覧:', existingVenues.map(v => v.venueOrder))

    // venueOrderが送信されている場合はそれを使用、そうでなければ最小の空き番号を計算
    let nextVenueOrder: number
    
    if (venueOrder !== undefined) {
      console.log('📤 [POST /venues] クライアントから送信されたvenueOrderを使用:', venueOrder)
      nextVenueOrder = venueOrder
    } else {
      console.log('🔢 [POST /venues] 最小の空きvenueOrderを計算')
      // 最小の空きvenueOrderを計算
      nextVenueOrder = 1
      for (const venue of existingVenues) {
        if (venue.venueOrder === nextVenueOrder) {
          nextVenueOrder++
        } else {
          break // 空き番号が見つかった
        }
      }
      console.log('🔢 [POST /venues] 計算されたvenueOrder:', nextVenueOrder)
    }

    const venue = await prisma.venue.create({
      data: {
        eventId,
        venueOrder: nextVenueOrder,
        name,
        googleMapsUrl,
        totalAmount,
        paidBy,
      },
    })

    console.log('✅ [POST /venues] お店作成成功:', venue)
    return NextResponse.json(venue)
  } catch (error) {
    console.error('❌ [POST /venues] エラー:', error)
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    )
  }
}
