'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import VideoPlayer from './VideoPlayer'

interface ScreensaverProps {
  onExit?: () => void
  disableInteraction?: boolean
}

interface MediaSettings {
  start?: number
  end?: number
  autoplay?: boolean
}

export default function Screensaver({ onExit, disableInteraction }: ScreensaverProps) {
  const [images, setImages] = useState<string[]>([])
  const [mediaSettings, setMediaSettings] = useState<MediaSettings[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const nextVideoRef = useRef<HTMLVideoElement>(null)
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
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching media:', error)
      }
    }

    fetchMedia()
  }, [])

  // Handle media rotation
  useEffect(() => {
    if (images.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [images])

  const currentUrl = images[currentIndex]
  const currentSettings = mediaSettings[currentIndex] || {}
  const isVideo = currentUrl?.match(/\.(mp4|webm|mov)$/i) !== null

  const nextIndex = (currentIndex + 1) % images.length
  const nextUrl = images[nextIndex]
  const nextSettings = mediaSettings[nextIndex] || {}
  const isNextVideo = nextUrl?.match(/\.(mp4|webm|mov)$/i) !== null

  const handleVideoEnd = () => {
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
        {isVideo ? (
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
              WebkitTransform: 'translate3d(0,0,0)'
            }}
          />
        )}
      </div>

      {/* Preload next image/video */}
      {isNextVideo && nextUrl && nextSettings && (
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