'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [media, setMedia] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchScreensaverMedia = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('media')
        .eq('slug', 'screensaver')
        .single()

      if (data?.media) {
        setMedia(data.media)
      } else {
        // Fallback images if no screensaver data
        setMedia([
          '/media/placeholder1.jpg',
          '/media/placeholder2.jpg'
        ])
      }
      setIsLoading(false)
    }

    fetchScreensaverMedia()
  }, [])

  useEffect(() => {
    if (media.length === 0) return

    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % media.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [media])

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      window.location.href = '/work'
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <main className="min-h-screen w-full relative bg-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="flex justify-between items-center p-8">
          <Link 
            href="/"
            className="font-gt-america text-lg text-black hover:opacity-75 transition-opacity no-underline"
          >
            Royce O'Toole
          </Link>
          <Link 
            href="/contact"
            className="font-gt-america-mono text-sm text-black hover:opacity-75 transition-opacity no-underline"
          >
            Contact
          </Link>
        </div>
      </header>

      {/* Screensaver Images */}
      <div className="h-screen w-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMediaIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {media[currentMediaIndex] ? (
              <Image
                src={media[currentMediaIndex]}
                alt="Screensaver"
                fill
                className="object-cover"
                priority
                quality={95}
              />
            ) : (
              // Fallback background
              <div className="absolute inset-0 bg-gray-100" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enter Link */}
      <Link
        href="/work"
        className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group no-underline"
      >
        <span className="font-gt-america text-lg text-black mix-blend-difference group-hover:opacity-75 transition-opacity">
          Enter
        </span>
      </Link>
    </main>
  )
} 