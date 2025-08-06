import { getPrisma } from '@/lib/prisma'
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
    const prisma = getPrisma()
    const event = await prisma.events.create({
      data: {
        title,
        event_date: new Date(eventDate),
        user_id: session.user.id, // ユーザーIDを設定（snake_case）
        created_at: new Date(),
        updated_at: new Date(),
        participants: {
          create: participants.map((participant: any) => ({
            nickname: participant.nickname,
            gender: participant.gender,
            role: participant.role,
            stay_range: JSON.stringify(participant.stayRange), // ObjectをJSON文字列に変換（snake_case）
            created_at: new Date(),
          })),
        },
        venues: {
          create: venues.map((venue: any) => ({
            venue_order: venue.venueOrder, // snake_case
            name: venue.name,
            google_maps_url: venue.googleMapsUrl, // snake_case
            total_amount: venue.totalAmount, // snake_case
            paid_by: venue.paidBy, // snake_case
            created_at: new Date(),
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
    const prisma = getPrisma()
    const events = await prisma.events.findMany({
      where: {
        user_id: session.user.id, // ユーザーIDでフィルタリング（snake_case）
      },
      include: {
        participants: true,
        venues: true,
        settlements: true,
      },
      orderBy: {
        event_date: 'desc',
      },
    })

    // データベースのsnake_caseをフロントエンド用のcamelCaseに変換
    const eventsWithParsedData = events.map(event => ({
      ...event,
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
          stayRange: parsedStayRange
        };
      }),
      venues: event.venues.map(venue => ({
        ...venue,
        venueOrder: venue.venue_order, // snake_case -> camelCase
        googleMapsUrl: venue.google_maps_url, // snake_case -> camelCase  
        totalAmount: venue.total_amount, // snake_case -> camelCase
        paidBy: venue.paid_by // snake_case -> camelCase
      }))
    }))

    return NextResponse.json(eventsWithParsedData)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
} 
