'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import VideoPlayer from './VideoPlayer'
import { supabase } from '@/lib/supabase'

interface MediaSettings {
  start?: number
  end?: number
}

interface ScreensaverProps {
  onExit?: () => void
  disableInteraction?: boolean
  excludeVideos?: boolean
}

export default function Screensaver({ onExit, disableInteraction, excludeVideos }: ScreensaverProps) {
  const [images, setImages] = useState<string[]>([])
  const [mediaSettings, setMediaSettings] = useState<MediaSettings[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isVideoEnded, setIsVideoEnded] = useState(false)
  const nextVideoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        // Get the Screensaver project first
        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('name', 'Screensaver')
          .single()

        if (project?.media) {
          let mediaUrls = project.media
          const settings = project.media_settings || Array(project.media.length).fill({})

          // Filter out videos if excludeVideos is true
          if (excludeVideos) {
            mediaUrls = mediaUrls.filter((url: string) => !url.toLowerCase().endsWith('.mp4'))
          }

          setImages(mediaUrls)
          setMediaSettings(settings)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching media:', error)
        setIsLoading(false)
      }
    }

    fetchMedia()
  }, [excludeVideos])

  const isVideoUrl = (url: string) => {
    return url?.toLowerCase().endsWith('.mp4')
  }

  const handleVideoEnd = () => {
    setIsVideoEnded(true)
    advanceMedia()
  }

  const advanceMedia = () => {
    if (images.length === 0) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  useEffect(() => {
    if (images.length === 0) return

    const currentUrl = images[currentIndex]
    const isVideo = isVideoUrl(currentUrl)

    if (!isVideo && !isLoading) {
      // For images, set up interval
      intervalRef.current = setInterval(advanceMedia, 5000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [images, currentIndex, isLoading])

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

  if (images.length === 0) {
    return null
  }

  const currentUrl = images[currentIndex]
  const currentSettings = mediaSettings[currentIndex] || {}
  const isVideo = isVideoUrl(currentUrl)
  const nextIndex = (currentIndex + 1) % images.length
  const nextUrl = images[nextIndex]
  const nextSettings = mediaSettings[nextIndex] || {}
  const isNextVideo = isVideoUrl(nextUrl)

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
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>

      {/* Preload next video if it exists and is a video */}
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