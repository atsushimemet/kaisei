import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, eventDate, participants, venues } = body

    // 飲み会を作成
    const event = await prisma.event.create({
      data: {
        title,
        eventDate: new Date(eventDate),
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
    const events = await prisma.event.findMany({
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
