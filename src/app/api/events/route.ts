import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

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
            stayRange: participant.stayRange,
          })),
        },
        venues: {
          create: venues.map((venue: any) => ({
            venueOrder: venue.venueOrder,
            name: venue.name,
            googleMapsUrl: venue.googleMapsUrl,
            totalAmount: venue.totalAmount,
            paymentMethod: venue.paymentMethod,
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

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
} 
