import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dunuya Distribution',
  description: 'Eau filtrée et la santé pour toute la famille',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
