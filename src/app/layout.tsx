import { gtAmerica, gtAmericaMono, quadrant } from '@/styles/fonts'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Royce O\'Toole',
  description: 'Portfolio of Royce O\'Toole',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${gtAmerica.variable} ${gtAmericaMono.variable} ${quadrant.variable}`}>
      <body className="min-h-screen bg-white">
        <div className="min-h-screen bg-white">
          {/* Shared Header */}
          <header className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200">
            <div className="w-full px-16">
              <div className="flex justify-between items-center py-4">
                <Link 
                  href="/"
                  className="font-gt-america text-sm hover:opacity-75 transition-opacity"
                >
                  Royce O'Toole
                </Link>
                <Link 
                  href="/contact"
                  className="font-gt-america text-sm hover:opacity-75 transition-opacity"
                >
                  Contact
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="pt-16">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  )
} 