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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl overflow-hidden max-w-3xl w-full"
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
        <div className="p-6">
          <h3 className="font-gt-america text-xl mb-2">{project.name}</h3>
          <p className="font-gt-america text-gray-600">{project.description_short}</p>
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

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Force grid view on mobile
  useEffect(() => {
    if (isMobile) setIsGridView(true)
  }, [isMobile])

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-8 bg-white z-40 border-b">
        <Link 
          href="/"
          className="font-gt-america text-lg hover:opacity-75 transition-opacity"
        >
          Royce O'Toole
        </Link>
        <Link 
          href="/contact"
          className="font-gt-america-mono text-sm hover:opacity-75 transition-opacity"
        >
          Contact
        </Link>
      </header>

      <div className="pt-24 px-8 flex flex-col md:flex-row">
        {/* Filters Sidebar */}
        <aside className={`${isMobile ? 'mb-8' : 'w-64 flex-shrink-0'}`}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-quadrant text-4xl">Work</h1>
            {!isMobile && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`px-4 py-1 font-gt-america-mono text-sm ${isGridView ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  GRID
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`px-4 py-1 font-gt-america-mono text-sm ${!isGridView ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                  LIST
                </button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Type Filter */}
            <div>
              <h3 className="font-gt-america-mono text-sm mb-4">Type</h3>
              <div className="space-y-2">
                {[
                  { name: 'Architecture', count: 5 },
                  { name: 'Objects', count: 6 },
                  { name: 'Visual', count: 2 }
                ].map(({ name, count }) => (
                  <label key={name} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.type?.includes(name as ProjectType)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...(filters.type || []), name as ProjectType]
                            : filters.type?.filter((t) => t !== name)
                          updateFilters({ ...filters, type: newTypes })
                        }}
                        className="mr-2 cursor-pointer"
                      />
                      <span className={`font-gt-america-mono text-sm ${filters.type?.includes(name as ProjectType) ? '' : 'text-gray-400'}`}>
                        {name}
                      </span>
                    </div>
                    <span className="font-gt-america-mono text-sm text-gray-400">
                      ({count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <h3 className="font-gt-america-mono text-sm mb-4">Role</h3>
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
                        className="mr-2 cursor-pointer"
                      />
                      <span className={`font-gt-america-mono text-sm ${filters.role?.includes(name as ProjectRole) ? '' : 'text-gray-400'}`}>
                        {name}
                      </span>
                    </div>
                    <span className="font-gt-america-mono text-sm text-gray-400">
                      ({count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <h3 className="font-gt-america-mono text-sm mb-4">Year</h3>
              <div className="space-y-2">
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((year) => (
                  <label key={year} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="year"
                        checked={filters.year === year}
                        onChange={() => updateFilters({ ...filters, year })}
                        className="mr-2 cursor-pointer"
                      />
                      <span className={`font-gt-america-mono text-sm ${filters.year === year ? '' : 'text-gray-400'}`}>
                        {year}
                      </span>
                    </div>
                    <span className="font-gt-america-mono text-sm text-gray-400">
                      ({year === 2025 ? 1 : year === 2024 ? 3 : 2})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Projects Grid/List */}
        <div className={`${isMobile ? '' : 'flex-1 pl-8'}`}>
          {isGridView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/work/${project.slug}`}
                  className="group relative aspect-[4/3] overflow-hidden bg-gray-100"
                  onMouseEnter={() => setPreviewProject(project)}
                  onMouseLeave={() => setPreviewProject(null)}
                >
                  {project.cover && (
                    <Image
                      src={project.cover}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <h3 className="font-gt-america text-white text-lg">
                      {project.name}
                    </h3>
                    <div className="font-gt-america-mono text-white/75 text-sm">
                      {project.type[0]}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/work/${project.slug}`}
                  className="block group py-4"
                  onMouseEnter={() => setPreviewProject(project)}
                  onMouseLeave={() => setPreviewProject(null)}
                >
                  <div className="grid grid-cols-[1fr,2fr,1fr,auto] gap-8 items-center">
                    <div className="font-gt-america-mono text-sm">
                      {project.type.join(', ')}
                    </div>
                    <div>
                      <h3 className="font-gt-america text-lg group-hover:opacity-75 transition-opacity">
                        {project.name}
                      </h3>
                      <p className="font-gt-america text-gray-500">
                        {project.description_short}
                      </p>
                    </div>
                    <div className="font-gt-america-mono text-sm">
                      {project.role.join(', ')}
                    </div>
                    <div className="font-gt-america-mono text-sm">
                      {project.year}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
        <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-8 bg-white z-40 border-b">
          <div className="font-gt-america text-lg">Royce O'Toole</div>
          <div className="font-gt-america-mono text-sm">Contact</div>
        </header>
        <div className="pt-24 px-8 flex">
          <div className="w-64 flex-shrink-0">
            <h1 className="font-quadrant text-4xl mb-8">Work</h1>
          </div>
          <div className="flex-1 pl-8">
            <div className="animate-pulse space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <WorkContent />
    </Suspense>
  )
} 