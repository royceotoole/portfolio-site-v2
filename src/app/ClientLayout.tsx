'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return (
    <div className="min-h-screen bg-white">
      {/* Shared Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 ${isHomePage ? '' : 'border-b border-gray-350'}`}>
        <div className="w-full px-16">
          <div className="flex justify-between items-center py-2">
            <Link 
              href="/work"
              className={`font-gt-america text-sm tracking-[-0.015em] hover:opacity-75 transition-opacity ${isHomePage ? 'text-white' : ''}`}
            >
              Royce O'Toole
            </Link>
            <a 
              href="mailto:royceotoole@gmail.com"
              className={`font-gt-america text-sm tracking-[-0.015em] hover:opacity-75 transition-opacity ${isHomePage ? 'text-white' : ''}`}
            >
              Contact
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
} 