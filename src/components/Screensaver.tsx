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
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVideoEnded, setIsVideoEnded] = useState(false)
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

  // Preload images when the images array changes
  useEffect(() => {
    // Clear existing cache
    imageCache.current = []
    
    // Preload all images
    images.forEach((url) => {
      if (!isVideoUrl(url)) {
        const img = document.createElement('img')
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
      // For images, change every 1.5 seconds
      intervalRef.current = setInterval(() => {
        setCurrentIndex(next)
      }, 1500)
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
    console.log('Starting to load screensaver images...')
    try {
      // Get the exact project named "Screensaver"
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('name', 'Screensaver')
        .single()

      console.log('Full project data:', project)
      console.log('Error if any:', error)

      if (error) {
        console.error('Supabase error:', error)
        setIsLoading(false)
        return
      }

      if (!project) {
        console.log('No project found with name "Screensaver"')
        setIsLoading(false)
        return
      }

      if (!project.media?.length) {
        console.log('Project found but no media:', project)
        setIsLoading(false)
        return
      }

      // Create empty settings array if none exists
      const settings = project.media_settings || Array(project.media.length).fill({})

      // Shuffle both arrays while keeping them aligned
      const [shuffledMedia, shuffledSettings] = shuffleArrays(project.media, settings)

      console.log('Setting shuffled media:', shuffledMedia)
      console.log('Setting shuffled media settings:', shuffledSettings)
      
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

  // For mobile, only use images and simpler transitions
  useEffect(() => {
    if (!disableInteraction) return // Only apply this logic for mobile mode

    // Filter out videos for mobile
    const imageOnlyUrls = images.filter(url => !url.match(/\.(mp4|webm|mov)$/i))
    setImages(imageOnlyUrls)
    
    // Use a simpler transition for mobile
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imageOnlyUrls.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [images, disableInteraction])

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