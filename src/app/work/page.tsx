'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Project, ProjectType, ProjectRole } from '@/lib/supabase'
import VideoPlayer from '@/components/VideoPlayer'

interface Filters {
  type: ProjectType[]
  role: ProjectRole[]
}

function ProjectPreview({ project, onClose }: { project: Project; onClose: () => void }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % project.media.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [project.media])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg overflow-hidden max-w-4xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative aspect-video">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMediaIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Image
                src={project.media[currentMediaIndex]}
                alt={project.name}
                fill
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function WorkContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isGridView, setIsGridView] = useState(false)
  const [filters, setFilters] = useState<Filters>({ type: [], role: [] })
  const [previewProject, setPreviewProject] = useState<Project | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Calculate counts for each type and role
  const typeCounts = {
    Architecture: projects.filter(p => p.type.includes('Architecture')).length,
    Objects: projects.filter(p => p.type.includes('Objects')).length,
    Visual: projects.filter(p => p.type.includes('Visual')).length,
  }

  const roleCounts = {
    Design: projects.filter(p => p.role.includes('Design')).length,
    Build: projects.filter(p => p.role.includes('Build')).length,
    Manage: projects.filter(p => p.role.includes('Manage')).length,
  }

  useEffect(() => {
    const fetchProjects = async () => {
      let query = supabase.from('projects').select('*').order('importance', { ascending: true })

      // We don't filter in the query anymore - we'll filter on the client side
      const { data, error } = await query
      console.log('Supabase query result:', { data, error })
      
      if (data) {
        const filteredData = data.filter(p => p.slug !== 'screensaver')
        console.log('Filtered projects:', filteredData)
        setProjects(filteredData)
      }
    }

    fetchProjects()
  }, []) // Only fetch when component mounts

  useEffect(() => {
    const type = searchParams?.get('type')?.split(',').filter(Boolean) as ProjectType[]
    const role = searchParams?.get('role')?.split(',').filter(Boolean) as ProjectRole[]

    // If no URL parameters, set all filters to be active
    if (!searchParams?.has('type') && !searchParams?.has('role')) {
      setFilters({
        type: ['Architecture', 'Objects', 'Visual'],
        role: ['Design', 'Build', 'Manage']
      })
    } else {
      // Otherwise use the URL parameters
      setFilters({
        type: type || [],
        role: role || []
      })
    }
  }, [searchParams])

  const updateFilters = (newFilters: Filters) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    // Only add parameters if there are filters selected
    if (newFilters.type?.length) {
      params.set('type', newFilters.type.join(','))
    } else {
      params.delete('type')
    }
    
    if (newFilters.role?.length) {
      params.set('role', newFilters.role.join(','))
    } else {
      params.delete('role')
    }

    // Update the URL without reloading the page
    router.push(`/work?${params.toString()}`, { scroll: false })
    setFilters(newFilters)
  }

  const getTypeColor = (type: ProjectType) => {
    switch (type) {
      case 'Architecture':
        return 'bg-architecture'
      case 'Objects':
        return 'bg-objects'
      case 'Visual':
        return 'bg-visual'
      default:
        return 'bg-gray-200'
    }
  }

  const filteredProjects = projects.filter(project => {
    // If no type filters are selected, show all types
    const typeMatch = filters.type.length === 0 || project.type.some(t => filters.type.includes(t))
    
    // For roles, show projects that contain ANY of the selected roles
    const roleMatch = filters.role.length === 0 || project.role.some(r => filters.role.includes(r))
    
    return typeMatch && roleMatch
  })

  return (
    <div className="w-full px-16 min-h-screen pb-16 relative">
      {/* Fixed Background */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-white z-20" />

      {/* Fixed Header Section */}
      <div className="fixed top-20 left-0 right-0 bg-white z-50">
        <div className="px-16">
          <h1 className="font-quadrant-light text-4xl mb-12 pt-4">Work</h1>

          <div className="flex">
            {/* Left Fixed Header */}
            <div className="w-64 flex-shrink-0">
              <div className="mb-8">
                <div className="flex w-full text-xs font-gt-america-mono border border-gray-350">
                  <button
                    onClick={() => setIsGridView(false)}
                    className={`flex-1 px-4 py-1 hover:text-gray-600 ${!isGridView ? 'bg-gray-100' : ''}`}
                  >
                    LIST
                  </button>
                  <button
                    onClick={() => setIsGridView(true)}
                    className={`flex-1 px-4 py-1 hover:text-gray-600 ${isGridView ? 'bg-gray-100' : ''}`}
                  >
                    GRID
                  </button>
                </div>
              </div>
              <div className="font-gt-america-mono text-xs tracking-wide pb-2 border-b border-gray-350">FILTER</div>
            </div>

            {/* Right Fixed Header */}
            <div className="flex-1 ml-16">
              <div className="invisible mb-8">
                <div className="flex w-full text-xs font-gt-america-mono border border-gray-350">
                  <div className="flex-1 px-4 py-1">SPACER</div>
                </div>
              </div>

              {/* List Headers and Border */}
              <div className="flex font-gt-america-mono text-xs pb-2 border-b border-gray-350">
                <div className={`w-[21.6rem] ${isGridView ? 'opacity-0' : ''}`}>PROJECT</div>
                <div className={`flex-1 ${isGridView ? 'opacity-0' : ''}`}>DESCRIPTION</div>
                <div className={`w-64 ${isGridView ? 'opacity-0' : ''}`}>ROLE</div>
                <div className={`w-20 text-right ${isGridView ? 'opacity-0' : ''}`}>YEAR</div>
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
        {/* Left Static Filter Content */}
        <div className="w-64 flex-shrink-0 fixed" style={{ top: 'calc(226px + 2rem)', left: '4rem' }}>
          <div className="space-y-8 pt-2">
            {/* Type Filter */}
            <div>
              <h3 className="font-gt-america font-bold text-sm mb-3 pt-2">Type</h3>
              <div className="divide-y divide-gray-350">
                {[
                  { name: 'Architecture' as ProjectType },
                  { name: 'Objects' as ProjectType },
                  { name: 'Visual' as ProjectType }
                ].map(({ name }) => (
                  <label key={name} className="flex items-center justify-between group cursor-pointer py-1.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${getTypeColor(name)} ${!filters.type.includes(name) ? 'opacity-50' : ''}`} />
                      <input
                        type="checkbox"
                        checked={filters.type.includes(name)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.type, name]
                            : filters.type.filter((t) => t !== name)
                          setFilters({ ...filters, type: newTypes })
                        }}
                        className="hidden"
                      />
                      <span className={`font-gt-america text-sm transition-all ${
                        filters.type.includes(name) 
                          ? 'opacity-100 hover:text-gray-500' 
                          : 'text-black/30 hover:text-black hover:opacity-100'
                      }`}>
                        {name}
                      </span>
                    </div>
                    <span className={`font-gt-america-mono text-xs ${filters.type.includes(name) ? 'opacity-100' : 'opacity-30'}`}>
                      ({typeCounts[name]})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <h3 className="font-gt-america font-bold text-sm mb-3">Role</h3>
              <div className="divide-y divide-gray-350">
                {[
                  { name: 'Design' as ProjectRole },
                  { name: 'Build' as ProjectRole },
                  { name: 'Manage' as ProjectRole }
                ].map(({ name }) => (
                  <label key={name} className="flex items-center justify-between group cursor-pointer py-1.5 first:pt-0 last:pb-0">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.role.includes(name)}
                        onChange={(e) => {
                          const newRoles = e.target.checked
                            ? [...filters.role, name]
                            : filters.role.filter((r) => r !== name)
                          setFilters({ ...filters, role: newRoles })
                        }}
                        className="hidden"
                      />
                      <span className={`font-gt-america text-sm transition-all ${
                        filters.role.includes(name) 
                          ? 'opacity-100 hover:text-gray-500' 
                          : 'text-black/30 hover:text-black hover:opacity-100'
                      }`}>
                        {name}
                      </span>
                    </div>
                    <span className={`font-gt-america-mono text-xs ${filters.role.includes(name) ? 'opacity-100' : 'opacity-30'}`}>
                      ({roleCounts[name]})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Scrollable Project Content */}
        <div className="flex-1 ml-80">
          {!isGridView ? (
            <div className="divide-y divide-gray-350">
              {filteredProjects.map((project) => (
                <div key={project.id} className="flex py-4 first:pt-0 items-center">
                  <div className="w-[21.6rem] flex items-center">
                    <Link href={`/work/${project.slug}`} className="group">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 items-center">
                          {project.type.map((type) => (
                            <div key={type} className={`w-2 h-2 ${getTypeColor(type)}`} />
                          ))}
                        </div>
                        <span className="font-gt-america text-lg group-hover:underline">{project.name}</span>
                      </div>
                    </Link>
                  </div>
                  <div className="flex-1 font-gt-america text-sm flex items-center">{project.description_short}</div>
                  <div className="w-64 font-gt-america text-sm flex items-center">{project.role.join(", ")}</div>
                  <div className="w-20 text-right font-gt-america-mono text-xs flex items-center justify-end">{project.year}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4" style={{ marginTop: '8px' }}>
              {filteredProjects.map((project) => (
                <Link key={project.id} href={`/work/${project.slug}`} className="group block relative aspect-[3/2] w-full">
                  {project.cover.match(/\.(mp4|webm|mov)$/i) ? (
                    <div className="absolute inset-0">
                      <VideoPlayer
                        src={project.cover}
                        className="!w-full !h-full"
                        autoplay={true}
                        hidePlayButton={true}
                        hideControls={true}
                      />
                      <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-30" />
                    </div>
                  ) : (
                    <>
                      <Image
                        src={project.cover}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-30" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-4 left-4 flex gap-1">
                    {project.type.map((type) => (
                      <div key={type} className={`w-2 h-2 ${getTypeColor(type)}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center px-8">
                    <p className="font-gt-america text-sm text-white text-center opacity-0 transition-opacity group-hover:opacity-100">{project.description_short}</p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-gt-america text-lg text-white group-hover:underline">{project.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
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

      {/* Project Preview Modal */}
      <AnimatePresence>
        {previewProject && (
          <ProjectPreview project={previewProject} onClose={() => setPreviewProject(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function WorkPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <Suspense fallback={
      <div className="w-full px-16">
        <div className="pt-20">
          <h1 className="font-quadrant-light text-4xl mb-8">Work</h1>
          <div className="flex">
            <div className="w-64" />
            <div className="flex-1">
              <div className="animate-pulse space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <WorkContent />
    </Suspense>
  )
} 