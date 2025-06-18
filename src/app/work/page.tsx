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
  year?: number
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

  useEffect(() => {
    const fetchProjects = async () => {
      let query = supabase.from('projects').select('*').order('importance', { ascending: true })

      if (filters.type?.length) {
        query = query.contains('type', filters.type)
      }
      if (filters.role?.length) {
        query = query.contains('role', filters.role)
      }
      if (filters.year) {
        query = query.eq('year', filters.year)
      }

      const { data, error } = await query
      console.log('Supabase query result:', { data, error })
      
      if (data) {
        const filteredData = data.filter(p => p.slug !== 'screensaver')
        console.log('Filtered projects:', filteredData)
        setProjects(filteredData)
      }
    }

    fetchProjects()
  }, [filters])

  useEffect(() => {
    const type = searchParams.get('type')?.split(',') as ProjectType[]
    const role = searchParams.get('role')?.split(',') as ProjectRole[]
    const year = searchParams.get('year')

    console.log('Current filters:', { type, role, year })

    setFilters({
      type: type || ['Architecture', 'Objects', 'Visual'],
      role: role || ['Design', 'Build', 'Manage'],
      year: year ? parseInt(year) : undefined,
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
    if (newFilters.year) {
      params.set('year', newFilters.year.toString())
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
    if (!project.type.some(t => filters.type.includes(t))) return false
    if (!project.role.some(role => filters.role.includes(role))) return false
    if (filters.year && project.year !== filters.year) return false
    return true
  })

  return (
    <div className="w-full px-16 min-h-screen pb-16 relative">
      {/* Fixed Header Section */}
      <div className="fixed top-20 left-16 right-16 bg-white z-10">
        <h1 className="font-quadrant-light text-4xl mb-12">Work</h1>

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
            <div className="font-gt-america-mono text-xs tracking-wide pb-4 border-b border-gray-300">FILTER</div>
          </div>

          {/* Vertical Divider */}
          <div className="mx-8 border-l border-gray-300" style={{ height: '91px' }} />

          {/* Right Fixed Header */}
          <div className="flex-1">
            <div className="invisible mb-8">
              <div className="flex w-full text-xs font-gt-america-mono border border-gray-300">
                <div className="flex-1 px-4 py-1">SPACER</div>
              </div>
            </div>

            {/* List Headers */}
            <div className="flex font-gt-america-mono text-xs pb-4 border-b border-gray-300">
              <div className="w-72">PROJECT</div>
              <div className="flex-1">DESCRIPTION</div>
              <div className="w-40">ROLE</div>
              <div className="w-20 text-right">YEAR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex pt-[248px] relative">
        {/* Left Scrollable Filter Content */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-8 h-[calc(100vh-248px-64px)] overflow-y-auto">
            {/* Type Filter */}
            <div>
              <h3 className="font-gt-america font-bold text-sm mb-3">Type</h3>
              <div className="divide-y divide-gray-300">
                {[
                  { name: 'Architecture' as ProjectType, count: 5 },
                  { name: 'Objects' as ProjectType, count: 6 },
                  { name: 'Visual' as ProjectType, count: 2 }
                ].map(({ name, count }) => (
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
                      ({count})
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
                  { name: 'Design' as ProjectRole, count: 5 },
                  { name: 'Build' as ProjectRole, count: 6 },
                  { name: 'Manage' as ProjectRole, count: 2 }
                ].map(({ name, count }) => (
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
                      ({count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <h3 className="font-gt-america font-bold text-sm mb-3">Year</h3>
              <div className="divide-y divide-gray-300">
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((year) => (
                  <label key={year} className="flex items-center justify-between group cursor-pointer py-1.5 first:pt-0 last:pb-0">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="year"
                        checked={filters.year === year}
                        onChange={() => setFilters({ ...filters, year })}
                        className="hidden"
                      />
                      <span className={`font-gt-america text-sm ${filters.year === year ? 'opacity-100' : 'opacity-30'}`}>
                        {year}
                      </span>
                    </div>
                    <span className={`font-gt-america-mono text-xs ${filters.year === year ? 'opacity-100' : 'opacity-30'}`}>
                      ({year === 2025 ? 1 : year === 2024 ? 3 : 3})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Divider - Outside Scrollable Areas */}
        <div className="mx-8 absolute" style={{ left: '256px', top: 0, bottom: '64px', width: '1px', backgroundColor: 'rgb(209 213 219)' }} />

        {/* Right Scrollable Project Content */}
        <div className="flex-1 ml-16">
          <div className="divide-y divide-gray-300 h-[calc(100vh-248px-64px)] overflow-y-auto">
            {filteredProjects.map((project) => (
              <div key={project.id} className="flex py-4 first:pt-0">
                <div className="w-72 flex items-center gap-2">
                  <div className={`w-2 h-2 ${getTypeColor(project.type[0])}`} />
                  <span className="font-gt-america text-sm">{project.name}</span>
                </div>
                <div className="flex-1 font-gt-america text-sm">{project.description_short}</div>
                <div className="w-40 font-gt-america text-sm">{project.role.join(", ")}</div>
                <div className="w-20 text-right font-gt-america-mono text-xs">{project.year}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Lines */}
      <div className="fixed bottom-16 left-16 right-16 flex bg-white">
        <div className="w-64 flex-shrink-0">
          <div className="border-t border-gray-300"></div>
        </div>
        <div className="mx-8"></div>
        <div className="flex-1">
          <div className="border-t border-gray-300"></div>
        </div>
      </div>

      {/* Project Preview Modal */}
      <AnimatePresence>
        {previewProject && (
          <ProjectPreview 
            project={previewProject} 
            onClose={() => setPreviewProject(null)} 
          />
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