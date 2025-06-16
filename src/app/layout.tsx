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
        <header className="fixed top-0 left-0 right-0 px-6 py-4 flex justify-between items-center z-50">
          <a href="/" className="font-gt-america text-lg">Royce O'Toole</a>
          <a href="/contact" className="font-gt-america text-lg">Contact</a>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
  )
} 