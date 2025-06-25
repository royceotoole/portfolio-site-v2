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
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [currentSettings, setCurrentSettings] = useState<MediaSettings>({})
  const [isVideo, setIsVideo] = useState(false)
  const [isNextVideo, setIsNextVideo] = useState(false)
  const [nextUrl, setNextUrl] = useState<string>('')
  const [nextSettings, setNextSettings] = useState<MediaSettings>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isVideoEnded, setIsVideoEnded] = useState(false)
  const nextVideoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data: mediaData } = await supabase
          .from('media')
          .select('*')
          .order('created_at', { ascending: false })

        if (mediaData) {
          // Filter out videos if excludeVideos is true
          const filteredMedia = excludeVideos 
            ? mediaData.filter(item => !item.url.toLowerCase().endsWith('.mp4'))
            : mediaData

          const urls = filteredMedia.map(item => item.url)
          const settings = filteredMedia.map(item => ({
            start: item.start_time,
            end: item.end_time
          }))

          setImages(urls)
          setMediaSettings(settings)
          
          // Set initial media
          if (urls.length > 0) {
            setCurrentUrl(urls[0])
            setCurrentSettings(settings[0] || {})
            setIsVideo(urls[0].toLowerCase().endsWith('.mp4'))
            
            // Set up next media
            if (urls.length > 1) {
              setNextUrl(urls[1])
              setNextSettings(settings[1] || {})
              setIsNextVideo(urls[1].toLowerCase().endsWith('.mp4'))
            }
          }
        }
      } catch (error) {
        console.error('Error fetching media:', error)
      }
    }

    fetchMedia()
  }, [excludeVideos])

  const handleVideoEnd = () => {
    setIsVideoEnded(true)
    advanceMedia()
  }

  const advanceMedia = () => {
    if (images.length === 0) return

    // Calculate next index
    const nextIndex = (currentIndex + 1) % images.length
    setCurrentIndex(nextIndex)

    // Update current media
    const newCurrentUrl = images[nextIndex]
    setCurrentUrl(newCurrentUrl)
    setCurrentSettings(mediaSettings[nextIndex] || {})
    setIsVideo(newCurrentUrl.toLowerCase().endsWith('.mp4'))

    // Update next media
    const nextNextIndex = (nextIndex + 1) % images.length
    const newNextUrl = images[nextNextIndex]
    setNextUrl(newNextUrl)
    setNextSettings(mediaSettings[nextNextIndex] || {})
    setIsNextVideo(newNextUrl.toLowerCase().endsWith('.mp4'))
  }

  useEffect(() => {
    if (!isVideo && !isLoading) {
      // For images, set up interval
      intervalRef.current = setInterval(advanceMedia, 5000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isVideo, isLoading, currentIndex])

  const handleClick = () => {
    if (disableInteraction) return
    onExit?.()
    router.push('/work')
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