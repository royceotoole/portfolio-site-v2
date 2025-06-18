'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'

export default function ProjectPage() {
  const { slug } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  useEffect(() => {
    const fetchProject = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data) {
        setProject(data)
      }
    }

    fetchProject()
  }, [slug])

  if (!project) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full px-16 min-h-screen pb-16 relative">
      {/* Fixed Background */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-white z-20" />

      {/* Fixed Header Section */}
      <div className="fixed top-20 left-0 right-0 bg-white z-50">
        <div className="px-16">
          <h1 className="font-quadrant text-4xl mb-12 pt-4">{project.name}</h1>

          <div className="flex">
            {/* Left Fixed Header */}
            <div className="w-64 flex-shrink-0">
              <div className="mb-8">
                <div className="flex w-full text-xs font-gt-america-mono border border-gray-300 invisible">
                  <div className="flex-1 px-4 py-1">SPACER</div>
                </div>
              </div>
              <div className="font-gt-america-mono text-xs tracking-wide pb-2 border-b border-gray-300">INFO</div>
            </div>

            {/* Right Fixed Header */}
            <div className="flex-1 ml-16">
              <div className="invisible mb-8">
                <div className="flex w-full text-xs font-gt-america-mono border border-gray-300">
                  <div className="flex-1 px-4 py-1">SPACER</div>
                </div>
              </div>

              {/* List Headers */}
              <div className="font-gt-america-mono text-xs pb-2 border-b border-gray-300">
                PHOTOS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Divider Line - Fixed */}
      <div className="fixed border-l border-gray-300" style={{ 
        left: '352px',
        top: 'calc(226px - 1px)', 
        bottom: '68px', 
        width: '1px', 
        backgroundColor: 'rgb(209 213 219)' 
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
              <h3 className="font-gt-america-mono text-xs pb-2 border-b border-gray-300 pt-2">DESCRIPTION</h3>
              <div className="font-gt-america text-sm pt-2">{project.description_long}</div>
            </div>
          </div>
        </div>

        {/* Right Scrollable Photos Content */}
        <div className="flex-1 ml-80">
          <div className="space-y-8 relative z-10">
            {project.media.map((media, index) => (
              <div key={media} className="relative aspect-[3/2]">
                <Image
                  src={media}
                  alt={`${project.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Footer with full bottom coverage */}
      <div className="fixed left-0 right-0 bottom-0 z-[1000] bg-white" style={{ top: 'calc(100% - 64px)' }}>
        <div className="px-16">
          <div className="flex">
            {/* Left Footer Line */}
            <div className="w-64 flex-shrink-0">
              <div className="border-t border-gray-300"></div>
            </div>
            
            {/* Vertical Divider Space */}
            <div className="mx-8"></div>
            
            {/* Right Footer Line */}
            <div className="flex-1">
              <div className="border-t border-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 