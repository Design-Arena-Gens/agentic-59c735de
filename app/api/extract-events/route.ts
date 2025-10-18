import { NextResponse } from 'next/server'
import { extractEventsFromEmail } from '@/lib/eventExtractor'

export async function POST(request: Request) {
  try {
    const { emailContent } = await request.json()

    if (!emailContent || typeof emailContent !== 'string') {
      return NextResponse.json(
        { error: 'Email content is required' },
        { status: 400 }
      )
    }

    const events = extractEventsFromEmail(emailContent)

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'No events found in the email content' },
        { status: 404 }
      )
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error extracting events:', error)
    return NextResponse.json(
      { error: 'Failed to extract events from email' },
      { status: 500 }
    )
  }
}
