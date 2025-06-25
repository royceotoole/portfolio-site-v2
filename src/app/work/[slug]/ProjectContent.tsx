'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Project } from '@/lib/supabase'
import VideoPlayer from '@/components/VideoPlayer'

export default function ProjectContent({ project }: { project: Project }) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)

    // Lock body scroll
    document.body.style.overflow = 'hidden'

    // Handle wheel events for horizontal scrolling
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (scrollContainerRef.current) {
        // Scale the scroll speed based on the input speed
        const scrollSpeed = Math.abs(e.deltaY) > 50 ? e.deltaY * 6 : e.deltaY * 2
        const behavior = Math.abs(e.deltaY) > 50 ? 'auto' : 'smooth'
        
        scrollContainerRef.current.scrollBy({
          left: scrollSpeed,
          behavior: behavior as ScrollBehavior
        })
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    // Cleanup
    return () => {
      document.body.style.overflow = ''
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [])

  const scrollToNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of container width
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollToPrevious = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of container width
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full px-16 min-h-screen pb-16 relative">
      {/* Fixed Background */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-white z-20" />

      {/* Fixed Header Section */}
      <div className="fixed top-20 left-0 right-0 bg-white z-50">
        <div className="px-16">
          <h1 className="font-quadrant-light text-4xl mb-12 pt-4">{project.name}</h1>

          <div className="flex">
            {/* Left Fixed Header */}
            <div className="w-64 flex-shrink-0">
              <div className="mb-8">
                <div className="flex w-full text-xs font-gt-america-mono border border-gray-350">
                  <button
                    onClick={() => router.push('/work')}
                    className="flex-1 px-4 py-1 bg-gray-100 flex items-center justify-center gap-2 hover:text-gray-600"
                  >
                    <svg width="12.6" height="9" viewBox="0 0 12.6 9" fill="none">
                      <path d="M5.8 0.7L1.4 4.3L5.8 7.9M1.4 4.3L12.6 4.3" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
                    </svg>
                    <span>BACK TO PROJECTS</span>
                  </button>
                </div>
              </div>
              <div className="font-gt-america-mono text-xs tracking-wide pb-2 border-b border-gray-350">INFO</div>
            </div>

            {/* Right Fixed Header */}
            <div className="flex-1 ml-16">
              <div className="invisible mb-8">
                <div className="flex w-full text-xs font-gt-america-mono border border-gray-350">
                  <div className="flex-1 px-4 py-1">SPACER</div>
                </div>
              </div>

              {/* List Headers */}
              <div className="font-gt-america-mono text-xs pb-2 border-b border-gray-350">
                PHOTOS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Divider Line - Fixed */}
      <div className="fixed border-l border-gray-350" style={{ 
        left: '352px',
        top: 'calc(226px - 1px)', 
        bottom: '68px', 
        width: '1px', 
        backgroundColor: 'rgb(182, 188, 197)' 
      }} />

      {/* Main Content Area */}
      <div className="flex pt-[226px] relative pb-16 z-0">
        {/* Left Static Info Content */}
        <div className="w-64 flex-shrink-0 fixed" style={{ top: 'calc(226px + 2rem)', left: '4rem' }}>
          <div className="space-y-8 pt-2">
            {/* Info Section */}
            <div>
              <div>
                <div className="flex justify-between items-center">
                  <div className="font-gt-america text-sm font-bold pt-2">Type</div>
                  <div className="font-gt-america text-sm text-right pt-2">{project.type.join(', ')}</div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="font-gt-america text-sm font-bold">Role</div>
                  <div className="font-gt-america text-sm text-right">{project.role.join(', ')}</div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="font-gt-america text-sm font-bold">Year</div>
                  <div className="font-gt-america text-sm text-right">{project.year}</div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="font-gt-america text-sm font-bold">Company</div>
                  <div className="font-gt-america text-sm text-right">{project.company}</div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h3 className="font-gt-america-mono text-xs pb-2 border-b border-gray-350 pt-2">DESCRIPTION</h3>
              <div className="font-gt-america text-sm pt-2">{project.description_long}</div>
            </div>
          </div>
        </div>

        {/* Right Scrollable Photos Content */}
        <div className="flex-1 ml-80">
          <div className="fixed inset-0 top-[226px] bottom-[68px] left-[352px] right-24">
            <div className="relative w-full h-full mt-10">
              {/* Navigation Arrows */}
              <button 
                onClick={scrollToPrevious}
                className="absolute left-[64px] top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Previous photo"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button 
                onClick={scrollToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Next photo"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Horizontal Scrolling Container */}
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto overflow-y-hidden w-full h-full ml-8 pt-10 pb-10 scroll-smooth"
                style={{ scrollBehavior: 'smooth' }}
              >
                {project.media.map((media, index) => {
                  const isVideo = media.match(/\.(mp4|webm|mov)$/i)
                  
                  return (
                    <div key={media} className="flex-none h-full" style={{ marginRight: '16px' }}>
                      <div className="h-full flex items-center">
                        {isVideo ? (
                          <div className="h-full">
                            <VideoPlayer 
                              src={media} 
                              className="h-full" 
                              autoplay={project.media_settings?.[index]?.autoplay ?? false}
                            />
                          </div>
                        ) : (
                          <div className="h-full">
                            <Image
                              src={media}
                              alt={`${project.name} - Image ${index + 1}`}
                              width={1200}
                              height={800}
                              className="h-full w-auto"
                              style={{ maxHeight: '100%', width: 'auto' }}
                              priority={index === 0}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer with full bottom coverage */}
      <div className="fixed left-0 right-0 bottom-0 z-[1000] bg-white" style={{ top: 'calc(100% - 64px)' }}>
        <div className="px-16">
          <div className="flex">
            {/* Left Footer Line */}
            <div className="w-64 flex-shrink-0">
              <div className="border-t border-gray-350"></div>
            </div>
            
            {/* Vertical Divider Space */}
            <div className="mx-8"></div>
            
            {/* Right Footer Line */}
            <div className="flex-1">
              <div className="border-t border-gray-350"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 