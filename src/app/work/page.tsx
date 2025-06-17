'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Project, ProjectType, ProjectRole } from '@/lib/supabase'
import Image from 'next/image'

interface Filters {
  type?: ProjectType[]
  role?: ProjectRole[]
  year?: number
}

function WorkContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isGridView, setIsGridView] = useState(true)
  const [filters, setFilters] = useState<Filters>({})
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
        setProjects(data)
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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center p-8 bg-white z-50">
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
      </nav>

      <div className="pt-24 px-8 flex">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <h1 className="font-quadrant text-4xl mb-8">Work</h1>
          
          <div className="mb-8">
            <div className="flex space-x-2 mb-8">
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
        <div className="flex-1 pl-8">
          {isGridView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/work/${project.slug}`}
                  className="group relative aspect-[4/3] overflow-hidden bg-gray-100"
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
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/work/${project.slug}`}
                  className="block group"
                >
                  <div className="grid grid-cols-[1fr,2fr,1fr,auto] gap-8 items-center py-4 border-t border-gray-200">
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
    </div>
  )
}

export default function WorkPage() {
  return (
    <WorkContent />
  )
} 