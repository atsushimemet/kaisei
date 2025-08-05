import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { venueOrder, name, googleMapsUrl, totalAmount, paidBy } = body
    const eventId = parseInt(params.id)

    const venue = await prisma.venue.create({
      data: {
        eventId,
        venueOrder,
        name,
        googleMapsUrl,
        totalAmount,
        paidBy,
      },
    })

    return NextResponse.json(venue)
  } catch (error) {
    console.error('Error creating venue:', error)
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    )
  }
}