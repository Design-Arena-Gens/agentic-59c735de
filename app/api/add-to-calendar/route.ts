import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { event } = await request.json()

    if (!event) {
      return NextResponse.json(
        { error: 'Event data is required' },
        { status: 400 }
      )
    }

    // Generate .ics file content for calendar
    const icsContent = generateICS(event)

    return NextResponse.json({
      success: true,
      message: 'Event prepared for calendar',
      icsContent,
      downloadUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
    })
  } catch (error) {
    console.error('Error adding to calendar:', error)
    return NextResponse.json(
      { error: 'Failed to add event to calendar' },
      { status: 500 }
    )
  }
}

function generateICS(event: any): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  // Parse the date and time
  const eventDate = new Date(event.date + ' ' + event.time)
  const startTime = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  // Add 1 hour for end time
  const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000)
  const endTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Gmail Calendar Agent//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${startTime}
DTEND:${endTime}
DTSTAMP:${timestamp}
UID:${timestamp}@gmail-calendar-agent
SUMMARY:${event.title}
DESCRIPTION:${event.description}
${event.location ? `LOCATION:${event.location}` : ''}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`
}
