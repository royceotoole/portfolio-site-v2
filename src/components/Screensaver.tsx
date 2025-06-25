'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { MediaSettings } from '@/lib/supabase'
import VideoPlayer from '@/components/VideoPlayer'

// Fisher-Yates shuffle algorithm that keeps two arrays in sync
function shuffleArrays(media: string[], settings: MediaSettings[]): [string[], MediaSettings[]] {
  const length = media.length
  const shuffledMedia = [...media]
  const shuffledSettings = [...settings]
  
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // Swap media
    const tempMedia = shuffledMedia[i]
    shuffledMedia[i] = shuffledMedia[j]
    shuffledMedia[j] = tempMedia
    // Swap settings
    const tempSettings = shuffledSettings[i]
    shuffledSettings[i] = shuffledSettings[j]
    shuffledSettings[j] = tempSettings
  }
  
  return [shuffledMedia, shuffledSettings]
}

interface ScreensaverProps {
  onExit?: () => void
  disableInteraction?: boolean
}

export default function Screensaver({ onExit, disableInteraction }: ScreensaverProps) {
  const [images, setImages] = useState<string[]>([])
  const [mediaSettings, setMediaSettings] = useState<MediaSettings[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const nextVideoRef = useRef<HTMLVideoElement>(null)
  const [mobileImages, setMobileImages] = useState<string[]>([])
  const [mobileIndex, setMobileIndex] = useState(0)
  const router = useRouter()

  // Fetch media on mount
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data: projects } = await supabase
          .from('projects')
          .select('media, media_settings')
          .not('media', 'eq', '{}')

        if (!projects) return

        const allMedia = projects.flatMap(project => project.media)
        const allSettings = projects.flatMap((project) => 
          project.media.map((_: string, mediaIndex: number) => project.media_settings?.[mediaIndex] || {})
        )

        setImages(allMedia)
        setMediaSettings(allSettings)

        // Set up mobile images (no videos)
        const imageOnlyUrls = allMedia.filter(url => !url.match(/\.(mp4|webm|mov)$/i))
        setMobileImages(imageOnlyUrls)

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching media:', error)
      }
    }

    fetchMedia()
  }, [])

  // Mobile-specific image rotation
  useEffect(() => {
    if (!disableInteraction || mobileImages.length === 0) return

    const interval = setInterval(() => {
      setMobileIndex(prevIndex => (prevIndex + 1) % mobileImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [disableInteraction, mobileImages])

  // Desktop video/image handling
  useEffect(() => {
    if (disableInteraction || images.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [disableInteraction, images])

  const currentUrl = disableInteraction ? mobileImages[mobileIndex] : images[currentIndex]
  const currentSettings = mediaSettings[currentIndex] || {}
  const isVideo = currentUrl?.match(/\.(mp4|webm|mov)$/i) !== null

  const nextIndex = (currentIndex + 1) % images.length
  const nextUrl = images[nextIndex]
  const nextSettings = mediaSettings[nextIndex] || {}
  const isNextVideo = nextUrl?.match(/\.(mp4|webm|mov)$/i) !== null

  const handleVideoEnd = () => {
    if (disableInteraction) return
    setCurrentIndex(nextIndex)
  }

  const handleClick = () => {
    if (disableInteraction) return
    onExit?.()
    router.push('/work')
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black cursor-pointer overflow-hidden" 
      onClick={handleClick}
    >
      {/* Current media item */}
      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'translate3d(0,0,0)' }}>
        {isVideo && !disableInteraction ? (
          <VideoPlayer
            key={`${currentUrl}-${currentSettings.start}-${currentSettings.end}`}
            src={currentUrl}
            autoplay={true}
            initialStart={currentSettings.start || 0}
            initialEnd={currentSettings.end}
            hideControls
            hidePlayButton
            muted
            className="w-full h-full"
            onEnded={handleVideoEnd}
            isScreensaver={true}
          />
        ) : (
          <img
            key={currentUrl}
            src={currentUrl}
            alt="Screensaver"
            className="w-full h-full object-cover"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'translate3d(0,0,0)',
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: 'translate3d(0,0,0)',
              transition: disableInteraction ? 'opacity 1s ease-in-out' : 'none'
            }}
          />
        )}
      </div>

      {/* Preload next image/video */}
      {!disableInteraction && isNextVideo && nextUrl && nextSettings && (
        <div className="hidden">
          <video
            ref={nextVideoRef}
            src={nextUrl}
            preload="auto"
          />
        </div>
      )}

      {/* Overlay elements - Only show if not in mobile mode */}
      {!disableInteraction && (
        <>
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-8 text-center">
            <p className="text-white text-lg font-gt-america">Click anywhere to enter</p>
          </div>
        </>
      )}
    </div>
  )
} 