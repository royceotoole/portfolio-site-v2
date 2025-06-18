'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Project, ProjectType, ProjectRole } from '@/lib/supabase'

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
  const [filters, setFilters] = useState<Filters>({
    type: ['Architecture', 'Objects', 'Visual'] as ProjectType[],
    role: ['Design', 'Build', 'Manage'] as ProjectRole[],
  })
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
    const type = searchParams.get('type')?.split(',') as ProjectType[]
    const role = searchParams.get('role')?.split(',') as ProjectRole[]

    console.log('Current filters:', { type, role })

    setFilters({
      type: type || ['Architecture', 'Objects', 'Visual'],
      role: role || ['Design', 'Build', 'Manage'],
    })
  }, [searchParams])

  const updateFilters = (newFilters: Filters) => {
    const params = new URLSearchParams()
    if (newFilters.type?.length) {
      params.set('type', newFilters.type.join(','))
    }
    if (newFilters.role?.length) {
      params.set('role', newFilters.role.join(','))
    }
    router.push(`/work?${params.toString()}`)
  }

  const getTypeColor = (type: ProjectType) => {
    switch (type) {
      case 'Architecture':
        return 'bg-yellow-400'
      case 'Objects':
        return 'bg-gray-400'
      case 'Visual':
        return 'bg-red-400'
      default:
        return 'bg-gray-200'
    }
  }

  const filteredProjects = projects.filter(project => {
    // If no type filters are selected, show all types
    const typeMatch = filters.type.length === 0 || project.type.some(t => filters.type.includes(t))
    // If no role filters are selected, show all roles
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
          <h1 className="font-quadrant text-4xl mb-12 pt-4">Work</h1>

          <div className="flex">
            {/* Left Fixed Header */}
            <div className="w-64 flex-shrink-0">
              <div className="mb-8">
                <div className="flex w-full text-xs font-gt-america-mono border border-gray-300">
                  <button
                    onClick={() => setIsGridView(true)}
                    className={`flex-1 px-4 py-1 ${isGridView ? 'bg-gray-100' : ''}`}
                  >
                    GRID
                  </button>
                  <button
                    onClick={() => setIsGridView(false)}
                    className={`flex-1 px-4 py-1 ${!isGridView ? 'bg-gray-100' : ''}`}
                  >
                    LIST
                  </button>
                </div>
              </div>
              <div className="font-gt-america-mono text-xs tracking-wide pb-2 border-b border-gray-300">FILTER</div>
            </div>

            {/* Right Fixed Header */}
            <div className="flex-1 ml-16">
              <div className="invisible mb-8">
                <div className="flex w-full text-xs font-gt-america-mono border border-gray-300">
                  <div className="flex-1 px-4 py-1">SPACER</div>
                </div>
              </div>

              {/* List Headers */}
              <div className="flex font-gt-america-mono text-xs pb-2 border-b border-gray-300">
                <div className="w-72">PROJECT</div>
                <div className="flex-1">DESCRIPTION</div>
                <div className="w-40">ROLE</div>
                <div className="w-20 text-right">YEAR</div>
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
        {/* Left Static Filter Content */}
        <div className="w-64 flex-shrink-0 fixed" style={{ top: 'calc(226px + 2rem)', left: '4rem' }}>
          <div className="space-y-8 pt-2">
            {/* Type Filter */}
            <div>
              <h3 className="font-gt-america font-bold text-sm mb-3 pt-2">Type</h3>
              <div className="divide-y divide-gray-300">
                {[
                  { name: 'Architecture' as ProjectType },
                  { name: 'Objects' as ProjectType },
                  { name: 'Visual' as ProjectType }
                ].map(({ name }) => (
                  <label key={name} className="flex items-center justify-between group cursor-pointer py-1.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${getTypeColor(name)}`} />
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
                      <span className={`font-gt-america text-sm ${filters.type.includes(name) ? 'opacity-100' : 'opacity-30'}`}>
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
              <div className="divide-y divide-gray-300">
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
                      <span className={`font-gt-america text-sm ${filters.role.includes(name) ? 'opacity-100' : 'opacity-30'}`}>
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
          <div className="divide-y divide-gray-300">
            {filteredProjects.map((project) => (
              <div key={project.id} className="flex items-center py-4 first:pt-0">
                <div className="w-72">
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
                <div className="w-40 font-gt-america text-sm flex items-center">{project.role.join(", ")}</div>
                <div className="w-20 text-right font-gt-america-mono text-xs flex items-center justify-end">{project.year}</div>
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
  return (
    <Suspense fallback={
      <div className="w-full px-16">
        <div className="pt-20">
          <h1 className="font-quadrant text-4xl mb-8">Work</h1>
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