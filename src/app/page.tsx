'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { isMobile } from '../utils/isMobile'

// Dynamically import the Screensaver component to avoid hydration issues
const Screensaver = dynamic(() => import('@/components/Screensaver'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )
})

const MobileLanding = dynamic(() => import('../components/MobileLanding'), {
  ssr: false
})

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    setIsMobileView(isMobile())
    const handleResize = () => setIsMobileView(isMobile())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobileView) return // Don't add interaction handlers on mobile

    // Check if there are any filter parameters
    const filters = {
      type: searchParams?.get('type'),
      role: searchParams?.get('role')
    }

    // Function to handle screensaver exit
    const handleExit = () => {
      setHasInteracted(true)
      // After animation completes, redirect to work page with filters
      setTimeout(() => {
        const params = new URLSearchParams()
        if (filters.type) params.set('type', filters.type)
        if (filters.role) params.set('role', filters.role)
        router.push(`/work${params.toString() ? `?${params.toString()}` : ''}`)
      }, 500) // Adjust timing as needed
    }

    // Add event listeners for user interaction
    const handleInteraction = () => {
      if (!hasInteracted) handleExit()
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('keydown', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [router, searchParams, hasInteracted, isMobileView])

  if (isMobileView) {
    return <MobileLanding />
  }

  return <Screensaver onExit={() => setHasInteracted(true)} />
} 