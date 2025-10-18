import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gmail to Calendar Agent',
  description: 'Automatically extract event details from Gmail and add reminders to your calendar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
