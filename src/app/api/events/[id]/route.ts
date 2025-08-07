import { getPrisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET(
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
            participants: true, // 正しいリレーション名
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

    // イベントがログインユーザーのものかチェック
    if (event.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // データベースのsnake_caseをフロントエンド用のcamelCaseに変換
    const eventWithParsedData = {
      ...event,
      eventDate: event.event_date, // snake_case -> camelCase
      participants: event.participants.map(participant => {
        let parsedStayRange: any;
        try {
          parsedStayRange = JSON.parse(participant.stay_range) as any;
        } catch {
          parsedStayRange = {
            firstParty: 1,
            secondParty: 1,
            thirdParty: 1
          };
        }
        return {
          ...participant,
          stayRange: parsedStayRange // フロントエンド用にcamelCaseで返す
        };
      }),
      venues: event.venues.map(venue => ({
        ...venue,
        venueOrder: venue.venue_order, // snake_case -> camelCase
        googleMapsUrl: venue.google_maps_url, // snake_case -> camelCase
        totalAmount: venue.total_amount, // snake_case -> camelCase
        paidBy: venue.paid_by // snake_case -> camelCase
      }))
    };

    return NextResponse.json(eventWithParsedData)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
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

    const eventId = parseInt(params.id)
    const prisma = getPrisma()
    
    // イベントが存在し、ログインユーザーのものかチェック
    const existingEvent = await prisma.events.findUnique({
      where: { id: eventId }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // イベントがログインユーザーのものかチェック
    if (existingEvent.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // イベントと関連データを削除（CASCADE設定により自動的に削除される）
    await prisma.events.delete({
      where: { id: eventId }
    })

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
} 
