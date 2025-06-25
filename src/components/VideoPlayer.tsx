'use client'

import { useState, useRef, useEffect } from 'react'

interface VideoPlayerProps {
  src: string
  className?: string
  autoplay?: boolean
  hidePlayButton?: boolean
  hideControls?: boolean
  onTrimChange?: (start: number, end: number) => void
  initialStart?: number
  initialEnd?: number
  showTrimControls?: boolean
  muted?: boolean
  onEnded?: () => void
  isScreensaver?: boolean
}

export default function VideoPlayer({ 
  src, 
  className = '', 
  autoplay = false, 
  hidePlayButton = false, 
  hideControls = false,
  onTrimChange,
  initialStart = 0,
  initialEnd,
  showTrimControls = false,
  muted = false,
  onEnded,
  isScreensaver = false
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [trimStart, setTrimStart] = useState(initialStart)
  const [trimEnd, setTrimEnd] = useState(initialEnd || duration)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const hasSetInitialTime = useRef(false)

  useEffect(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      setDuration(videoDuration)
      if (!initialEnd && !trimEnd) {
        setTrimEnd(videoDuration)
      }
    }
  }, [initialEnd, trimEnd])

  useEffect(() => {
    if (onTrimChange && (trimStart !== initialStart || trimEnd !== initialEnd)) {
      onTrimChange(trimStart, trimEnd)
    }
  }, [trimStart, trimEnd, onTrimChange, initialStart, initialEnd])

  // Reset states when src changes
  useEffect(() => {
    hasSetInitialTime.current = false
    setIsLoaded(false)
    setIsReady(false)
    setTrimStart(initialStart)
    setTrimEnd(initialEnd || duration)
  }, [src, initialStart, initialEnd, duration])

  // Handle initial video setup after metadata is loaded
  useEffect(() => {
    if (videoRef.current && isLoaded && !hasSetInitialTime.current) {
      if (isScreensaver && initialStart > 0) {
        videoRef.current.currentTime = initialStart
      }
      hasSetInitialTime.current = true
    }
  }, [isLoaded, initialStart, isScreensaver])

  // Handle autoplay after video is ready
  useEffect(() => {
    if (isReady && autoplay && videoRef.current) {
      if (isScreensaver && initialStart > 0) {
        videoRef.current.currentTime = initialStart
      }
      videoRef.current.play().catch(console.error)
    }
  }, [isReady, autoplay, isScreensaver, initialStart])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        // If we're at the end, reset to start before playing
        if (isScreensaver && videoRef.current.currentTime >= trimEnd) {
          videoRef.current.currentTime = trimStart
        }
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      const progress = (currentTime / videoRef.current.duration) * 100
      setProgress(progress)

      // Only handle trim end point in screensaver mode
      if (isScreensaver && currentTime >= trimEnd) {
        onEnded?.()
      }
    }
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current && videoRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      const newTime = pos * videoRef.current.duration
      
      // Only enforce trim bounds in screensaver mode
      if (!isScreensaver || (newTime >= trimStart && newTime <= trimEnd)) {
        videoRef.current.currentTime = newTime
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleTrimStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = parseFloat(e.target.value)
    if (newStart < trimEnd) {
      setTrimStart(newStart)
      if (videoRef.current) {
        videoRef.current.currentTime = newStart
      }
    }
  }

  const handleTrimEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = parseFloat(e.target.value)
    if (newEnd > trimStart) {
      setTrimEnd(newEnd)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      setDuration(videoDuration)
      setTrimEnd(initialEnd || videoDuration)
      setIsLoaded(true)
    }
  }

  const handleCanPlay = () => {
    setIsReady(true)
  }

  return (
    <div 
      className={`relative group inline-flex h-full ${className}`}
      style={{ backfaceVisibility: 'hidden' }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full cursor-pointer object-cover"
        style={{ backfaceVisibility: 'hidden' }}
        loop={false}
        playsInline
        muted={muted}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onClick={togglePlay}
      />
      
      {/* Big Play Button */}
      {!isPlaying && !hidePlayButton && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          <svg width="80" height="80" viewBox="0 0 80 80">
            <defs>
              <mask id="play-mask">
                <rect width="80" height="80" fill="white"/>
                <path 
                  d="M35 25L55 40L35 55Z"
                  fill="black"
                />
              </mask>
            </defs>
            <circle 
              cx="40" 
              cy="40" 
              r="38" 
              fill="white" 
              fillOpacity="0.9"
              mask="url(#play-mask)"
            />
          </svg>
        </button>
      )}

      {/* Controls Bar */}
      {!hideControls && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent pb-6 pt-12 px-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Timeline */}
          <div 
            ref={timelineRef}
            className="relative w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer"
            onClick={handleTimelineClick}
          >
            {/* Trim Range Indicator */}
            {showTrimControls && (
              <div 
                className="absolute h-full bg-blue-400/50"
                style={{
                  left: `${(trimStart / duration) * 100}%`,
                  width: `${((trimEnd - trimStart) / duration) * 100}%`
                }}
              />
            )}
            <div 
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-200"
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            
            {/* Time Display */}
            <div className="text-white text-sm">
              {videoRef.current && (
                `${formatTime(videoRef.current.currentTime)} / ${formatTime(duration)}`
              )}
            </div>

            {/* Trim Controls */}
            {showTrimControls && (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2">
                  <label className="text-white text-sm">Start:</label>
                  <input
                    type="number"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={trimStart.toFixed(1)}
                    onChange={handleTrimStartChange}
                    className="w-20 px-2 py-1 text-sm bg-white/10 text-white rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-white text-sm">End:</label>
                  <input
                    type="number"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={trimEnd.toFixed(1)}
                    onChange={handleTrimEndChange}
                    className="w-20 px-2 py-1 text-sm bg-white/10 text-white rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 