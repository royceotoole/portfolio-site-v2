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
      }
      setIsLoading(false)
    }

    fetchScreensaverMedia()
  }, [])

  useEffect(() => {
    if (media.length === 0) return

    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % media.length)
    }, 3000) // Slower transition

    return () => clearInterval(interval)
  }, [media])

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
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
    <main className="h-screen w-screen relative overflow-hidden bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 flex justify-between items-center p-8 z-20">
        <Link 
          href="/"
          className="font-gt-america text-lg hover:opacity-75 transition-opacity"
        >
          Royce O'Toole
        </Link>
        <Link 
          href="/contact"
          className="font-gt-america-mono text-sm hover:opacity-75 transition-opacity"
        >
          Contact
        </Link>
      </nav>

      {/* Screensaver background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMediaIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }} // Slower fade
          className="absolute inset-0"
        >
          {media[currentMediaIndex] && (
            <Image
              src={media[currentMediaIndex]}
              alt="Screensaver"
              fill
              className="object-cover"
              priority
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle Enter text */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Link
          href="/work"
          className="font-gt-america text-white text-lg opacity-75 hover:opacity-100 transition-opacity cursor-pointer mix-blend-difference"
        >
          Enter
        </Link>
      </div>
    </main>
  )
} 