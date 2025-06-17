'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Project, ProjectType, ProjectRole } from '@/lib/supabase'

interface Filters {
  type?: ProjectType[]
  role?: ProjectRole[]
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
  const [filters, setFilters] = useState<Filters>({})
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

      const { data } = await query
      if (data) {
        setProjects(data.filter(p => p.slug !== 'screensaver'))
      }
    }

    fetchProjects()
  }, [filters])

  useEffect(() => {
    const type = searchParams.get('type')?.split(',') as ProjectType[]
    const role = searchParams.get('role')?.split(',') as ProjectRole[]
    const year = searchParams.get('year')

    setFilters({
      type: type || undefined,
      role: role || undefined,
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

  const getTypeColor = (type: string) => {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-16">
          <div className="flex justify-between items-center py-4">
            <Link 
              href="/"
              className="font-gt-america text-sm hover:opacity-75 transition-opacity"
            >
              Royce O'Toole
            </Link>
            <Link 
              href="/contact"
              className="font-gt-america text-sm hover:opacity-75 transition-opacity"
            >
              Contact
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-16">
        <div className="pt-20">
          <h1 className="font-quadrant text-4xl mb-8">Work</h1>

          <div className="flex gap-32">
            {/* Filters Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <div className="mb-8">
                <div className="bg-gray-100 inline-flex text-xs font-gt-america-mono">
                  <button
                    onClick={() => setIsGridView(true)}
                    className={`px-4 py-1 ${isGridView ? 'bg-white' : ''}`}
                  >
                    GRID
                  </button>
                  <button
                    onClick={() => setIsGridView(false)}
                    className={`px-4 py-1 ${!isGridView ? 'bg-white' : ''}`}
                  >
                    LIST
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="font-gt-america-mono text-xs">FILTER</div>

                {/* Type Filter */}
                <div>
                  <h3 className="font-gt-america-mono text-xs mb-3">Type</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Architecture', count: 5 },
                      { name: 'Objects', count: 6 },
                      { name: 'Visual', count: 2 }
                    ].map(({ name, count }) => (
                      <label key={name} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 ${getTypeColor(name)}`} />
                          <input
                            type="checkbox"
                            checked={filters.type?.includes(name as ProjectType)}
                            onChange={(e) => {
                              const newTypes = e.target.checked
                                ? [...(filters.type || []), name as ProjectType]
                                : filters.type?.filter((t) => t !== name)
                              updateFilters({ ...filters, type: newTypes })
                            }}
                            className="hidden"
                          />
                          <span className={`font-gt-america-mono text-xs ${filters.type?.includes(name as ProjectType) ? 'opacity-100' : 'opacity-30'}`}>
                            {name}
                          </span>
                        </div>
                        <span className={`font-gt-america-mono text-xs ${filters.type?.includes(name as ProjectType) ? 'opacity-100' : 'opacity-30'}`}>
                          ({count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <h3 className="font-gt-america-mono text-xs mb-3">Role</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Design', count: 5 },
                      { name: 'Build', count: 6 },
                      { name: 'Manage', count: 2 }
                    ].map(({ name, count }) => (
                      <label key={name} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.role?.includes(name as ProjectRole)}
                            onChange={(e) => {
                              const newRoles = e.target.checked
                                ? [...(filters.role || []), name as ProjectRole]
                                : filters.role?.filter((r) => r !== name)
                              updateFilters({ ...filters, role: newRoles })
                            }}
                            className="hidden"
                          />
                          <span className={`font-gt-america-mono text-xs ${filters.role?.includes(name as ProjectRole) ? 'opacity-100' : 'opacity-30'}`}>
                            {name}
                          </span>
                        </div>
                        <span className={`font-gt-america-mono text-xs ${filters.role?.includes(name as ProjectRole) ? 'opacity-100' : 'opacity-30'}`}>
                          ({count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <h3 className="font-gt-america-mono text-xs mb-3">Year</h3>
                  <div className="space-y-2">
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((year) => (
                      <label key={year} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="year"
                            checked={filters.year === year}
                            onChange={() => updateFilters({ ...filters, year })}
                            className="hidden"
                          />
                          <span className={`font-gt-america-mono text-xs ${filters.year === year ? 'opacity-100' : 'opacity-30'}`}>
                            {year}
                          </span>
                        </div>
                        <span className={`font-gt-america-mono text-xs ${filters.year === year ? 'opacity-100' : 'opacity-30'}`}>
                          ({year === 2025 ? 1 : year === 2024 ? 3 : 2})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Projects List */}
            <div className="flex-1">
              {isGridView ? (
                <div className="grid grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/work/${project.slug}`}
                      className="group relative aspect-square bg-gray-100"
                    >
                      {project.cover && (
                        <Image
                          src={project.cover}
                          alt={project.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr,2fr,2fr,1fr,auto] gap-8 pb-2 border-b border-gray-200">
                    <div className="font-gt-america-mono text-xs opacity-30">PROJECT</div>
                    <div className="font-gt-america-mono text-xs opacity-30">DESCRIPTION</div>
                    <div />
                    <div className="font-gt-america-mono text-xs opacity-30">ROLE</div>
                    <div className="font-gt-america-mono text-xs opacity-30">YEAR</div>
                  </div>
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/work/${project.slug}`}
                      className="grid grid-cols-[1fr,2fr,2fr,1fr,auto] gap-8 group hover:opacity-50 transition-opacity"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${getTypeColor(project.type[0])}`} />
                        <span className="font-gt-america text-sm">{project.name}</span>
                      </div>
                      <div className="font-gt-america text-sm">
                        {project.description_short}
                      </div>
                      <div />
                      <div className="font-gt-america-mono text-xs">
                        {project.role.join(', ')}
                      </div>
                      <div className="font-gt-america-mono text-xs">
                        {project.year}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
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
      <div className="min-h-screen bg-white">
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200">
          <div className="flex justify-between items-center px-8 py-4">
            <div className="font-gt-america text-sm">Royce O'Toole</div>
            <div className="font-gt-america text-sm">Contact</div>
          </div>
        </header>
        <div className="pt-20 px-8">
          <h1 className="font-quadrant text-4xl mb-8">Work</h1>
          <div className="flex gap-32">
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