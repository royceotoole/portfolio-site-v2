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
        .eq('id', 'screensaver')
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
    }, 1500)

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
    <main className="h-screen w-screen relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMediaIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={media[currentMediaIndex]}
            alt="Screensaver"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>
      
      <Link
        href="/work"
        className="absolute inset-0 flex items-center justify-center text-white text-2xl font-quadrant hover:opacity-75 transition-opacity z-10"
      >
        Enter
      </Link>
    </main>
  )
} 