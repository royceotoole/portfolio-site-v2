import { gtAmerica, gtAmericaMono, quadrant } from '@/styles/fonts'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'Royce O\'Toole',
  description: 'Portfolio of architectural and design work',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${gtAmerica.variable} ${gtAmericaMono.variable} ${quadrant.variable}`}>
      <body className="min-h-screen bg-white">
        {children}
        <Analytics />
      </body>
    </html>
  )
} 