'use client'

import { useState } from 'react'

interface ExtractedEvent {
  title: string
  date: string
  time: string
  location?: string
  description: string
}

export default function Home() {
  const [emailContent, setEmailContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<ExtractedEvent[]>([])
  const [error, setError] = useState('')

  const handleExtract = async () => {
    setLoading(true)
    setError('')
    setEvents([])

    try {
      const response = await fetch('/api/extract-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailContent }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract events')
      }

      setEvents(data.events)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCalendar = async (event: ExtractedEvent) => {
    try {
      const response = await fetch('/api/add-to-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to calendar')
      }

      alert('Event added to calendar successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to calendar')
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Gmail to Calendar Agent
          </h1>
          <p className="text-gray-600 mb-8">
            Paste your email content below to automatically extract event details and add them to your calendar
          </p>

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Content
            </label>
            <textarea
              id="email"
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Paste your email content here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
          </div>

          <button
            onClick={handleExtract}
            disabled={loading || !emailContent.trim()}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Extracting Events...' : 'Extract Events'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Extracted Events ({events.length})
              </h2>
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {event.title}
                    </h3>
                    <div className="space-y-1 text-gray-600 mb-4">
                      <p>
                        <strong>Date:</strong> {event.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {event.time}
                      </p>
                      {event.location && (
                        <p>
                          <strong>Location:</strong> {event.location}
                        </p>
                      )}
                      <p>
                        <strong>Description:</strong> {event.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToCalendar(event)}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Add to Calendar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            How it works
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Paste your email content containing event information</li>
            <li>The agent extracts dates, times, locations, and event details</li>
            <li>Review the extracted events</li>
            <li>Click "Add to Calendar" to create calendar reminders</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
