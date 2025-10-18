interface ExtractedEvent {
  title: string
  date: string
  time: string
  location?: string
  description: string
}

export function extractEventsFromEmail(emailContent: string): ExtractedEvent[] {
  const events: ExtractedEvent[] = []

  // Normalize whitespace
  const content = emailContent.replace(/\s+/g, ' ').trim()

  // Pattern for dates: MM/DD/YYYY, DD-MM-YYYY, Month DD, YYYY, etc.
  const datePatterns = [
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g, // MM/DD/YYYY or DD-MM-YYYY
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\b/gi, // Month DD, YYYY
    /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/gi, // DD Month YYYY
  ]

  // Pattern for times: 3:00 PM, 15:00, 3pm, etc.
  const timePattern = /\b(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm|a\.m\.|p\.m\.)?\b/g

  // Pattern for locations
  const locationPatterns = [
    /\b(?:at|@|location:|venue:)\s*([A-Z][A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Room|Conference|Hall|Center|Building))/gi,
    /\b(?:at|@)\s*([A-Z][A-Za-z\s&]+(?:Hotel|Restaurant|Cafe|Office|Center|Hall))/gi,
  ]

  // Find all potential event indicators
  const eventKeywords = [
    'meeting', 'appointment', 'conference', 'call', 'interview', 'event',
    'webinar', 'session', 'presentation', 'workshop', 'training', 'seminar',
    'lunch', 'dinner', 'party', 'celebration', 'reminder', 'scheduled'
  ]

  const sentences = content.split(/[.!?]\s+/)

  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase()
    const hasEventKeyword = eventKeywords.some(keyword => lowerSentence.includes(keyword))

    if (hasEventKeyword) {
      let foundDate: string | null = null
      let foundTime: string | null = null
      let foundLocation: string | null = null

      // Extract date
      for (const pattern of datePatterns) {
        pattern.lastIndex = 0
        const dateMatch = pattern.exec(sentence)
        if (dateMatch) {
          foundDate = dateMatch[0]
          break
        }
      }

      // Extract time
      timePattern.lastIndex = 0
      const timeMatch = timePattern.exec(sentence)
      if (timeMatch) {
        foundTime = timeMatch[0]
      }

      // Extract location
      for (const pattern of locationPatterns) {
        pattern.lastIndex = 0
        const locationMatch = pattern.exec(sentence)
        if (locationMatch) {
          foundLocation = locationMatch[1].trim()
          break
        }
      }

      if (foundDate && foundTime) {
        // Extract title from sentence
        let title = sentence
          .replace(/\b(on|at|in|this|the|a|an)\b/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 100)

        if (title.length > 50) {
          const words = title.split(' ')
          title = words.slice(0, 8).join(' ')
        }

        events.push({
          title: title || 'Event',
          date: foundDate,
          time: foundTime,
          location: foundLocation || undefined,
          description: sentence.trim(),
        })
      }
    }
  })

  // If no events found using strict matching, try looser matching
  if (events.length === 0) {
    const lines = content.split(/\n/)
    let currentDate: string | null = null
    let currentTime: string | null = null

    lines.forEach(line => {
      // Check for dates
      for (const pattern of datePatterns) {
        pattern.lastIndex = 0
        const dateMatch = pattern.exec(line)
        if (dateMatch) {
          currentDate = dateMatch[0]
        }
      }

      // Check for times
      timePattern.lastIndex = 0
      const timeMatch = timePattern.exec(line)
      if (timeMatch) {
        currentTime = timeMatch[0]
      }

      // If we have both date and time in context, create event
      if (currentDate && currentTime && line.length > 10) {
        let foundLocation: string | null = null
        for (const pattern of locationPatterns) {
          pattern.lastIndex = 0
          const locationMatch = pattern.exec(line)
          if (locationMatch) {
            foundLocation = locationMatch[1].trim()
            break
          }
        }

        events.push({
          title: line.substring(0, 100).trim() || 'Event',
          date: currentDate,
          time: currentTime,
          location: foundLocation || undefined,
          description: line.trim(),
        })

        // Reset for next event
        currentDate = null
        currentTime = null
      }
    })
  }

  // Remove duplicates
  const uniqueEvents = events.filter((event, index, self) =>
    index === self.findIndex((e) => (
      e.date === event.date && e.time === event.time && e.title === event.title
    ))
  )

  return uniqueEvents
}
