'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVideoEnded, setIsVideoEnded] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout>()
  const imageCache = useRef<HTMLImageElement[]>([])
  const nextVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    console.log('Screensaver component mounted')
    loadScreensaverImages()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Filter out videos for mobile version
  useEffect(() => {
    if (disableInteraction && images.length > 0) {
      // On mobile, only use images
      const imageOnly = images.filter(url => !isVideoUrl(url))
      const imageSettings = mediaSettings.filter((_, index) => !isVideoUrl(images[index]))
      
      if (imageOnly.length > 0) {
        setImages(imageOnly)
        setMediaSettings(imageSettings)
        setCurrentIndex(0)
      }
    }
  }, [disableInteraction, images.length])

  // Preload images when the images array changes
  useEffect(() => {
    // Clear existing cache
    imageCache.current = []
    
    // Preload all images
    images.forEach((url) => {
      if (!isVideoUrl(url)) {
        const img = new Image()
        img.src = url
        imageCache.current.push(img)
      }
    })
  }, [images])

  useEffect(() => {
    if (images.length === 0) return

    // Calculate next index
    const next = (currentIndex + 1) % images.length
    setNextIndex(next)

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const currentUrl = images[currentIndex]
    const isVideo = isVideoUrl(currentUrl)

    if (!isVideo) {
      // For images, change every 2 seconds with fade transition
      intervalRef.current = setInterval(() => {
        setFadeOut(true)
        setTimeout(() => {
          setCurrentIndex(next)
          setFadeOut(false)
        }, 300) // Wait for fade out before changing image
      }, 2000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [images, currentIndex, isVideoEnded])

  const handleVideoEnd = () => {
    console.log('Video ended')
    setIsVideoEnded(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const loadScreensaverImages = async () => {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('name', 'Screensaver')
        .single()

      if (error) {
        console.error('Supabase error:', error)
        setIsLoading(false)
        return
      }

      if (!project || !project.media?.length) {
        console.log('No project or media found')
        setIsLoading(false)
        return
      }

      // Create empty settings array if none exists
      const settings = project.media_settings || Array(project.media.length).fill({})

      // Shuffle both arrays while keeping them aligned
      const [shuffledMedia, shuffledSettings] = shuffleArrays(project.media, settings)
      
      setImages(shuffledMedia)
      setMediaSettings(shuffledSettings)
      setIsLoading(false)
    } catch (err) {
      console.error('Unexpected error:', err)
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    if (disableInteraction) return
    onExit?.()
    router.push('/work')
  }

  const isVideoUrl = (url: string) => {
    return url?.match(/\.(mp4|webm|mov)$/i) !== null
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (images.length === 0) {
    console.log('No images found, redirecting to /work')
    router.push('/work')
    return null
  }

  const currentUrl = images[currentIndex]
  const nextUrl = nextIndex !== null ? images[nextIndex] : null
  const currentSettings = mediaSettings[currentIndex] || {}
  const nextSettings = nextIndex !== null ? mediaSettings[nextIndex] || {} : null
  const isVideo = isVideoUrl(currentUrl)
  const isNextVideo = nextUrl ? isVideoUrl(nextUrl) : false

  return (
    <div 
      className="fixed inset-0 bg-black cursor-pointer overflow-hidden" 
      onClick={handleClick}
    >
      {/* Current media item */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`} 
        style={{ backfaceVisibility: 'hidden', transform: 'translate3d(0,0,0)' }}
      >
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

      {/* Preload next image */}
      {nextUrl && !isNextVideo && (
        <div className="hidden">
          <img src={nextUrl} alt="" />
        </div>
      )}

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