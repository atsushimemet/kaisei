import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
    const { title, eventDate, participants, venues } = body

    // 飲み会を作成（ユーザーIDを設定）
    const event = await prisma.event.create({
      data: {
        title,
        eventDate: new Date(eventDate),
        userId: session.user.id, // ユーザーIDを設定
        participants: {
          create: participants.map((participant: any) => ({
            nickname: participant.nickname,
            gender: participant.gender,
            role: participant.role,
            stayRange: JSON.stringify(participant.stayRange), // ObjectをJSON文字列に変換
          })),
        },
        venues: {
          create: venues.map((venue: any) => ({
            venueOrder: venue.venueOrder,
            name: venue.name,
            googleMapsUrl: venue.googleMapsUrl,
            totalAmount: venue.totalAmount,
            paidBy: venue.paidBy,
          })),
        },
      },
      include: {
        participants: true,
        venues: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // セッションを取得してユーザーIDを確認
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ログインユーザーのイベントのみを取得
    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id, // ユーザーIDでフィルタリング
      },
      include: {
        participants: true,
        venues: true,
        settlements: true,
      },
      orderBy: {
        eventDate: 'desc',
      },
    })

    // stayRangeをJSONオブジェクトに変換して返す
    const eventsWithParsedStayRange = events.map(event => ({
      ...event,
      participants: event.participants.map(participant => {
        let parsedStayRange: any;
        try {
          parsedStayRange = JSON.parse(participant.stayRange) as any;
        } catch {
          parsedStayRange = {
            firstParty: 1,
            secondParty: 1,
            thirdParty: 1
          };
        }
        
        return {
          ...participant,
          stayRange: parsedStayRange
        };
      })
    }))

    return NextResponse.json(eventsWithParsedStayRange)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
} 
