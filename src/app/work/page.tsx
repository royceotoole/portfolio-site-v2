'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Project, ProjectType, ProjectRole } from '@/lib/supabase'

interface Filters {
  type?: ProjectType[]
  role?: ProjectRole[]
  year?: number
}

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isGridView, setIsGridView] = useState(false)
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
    <div className="flex min-h-screen pt-16">
      {/* Filters */}
      <aside className="w-64 p-6 border-r">
        <h2 className="font-quadrant text-xl mb-6">Filter</h2>
        
        <div className="space-y-6">
          {/* Type Filter */}
          <div>
            <h3 className="font-gt-america-mono text-sm mb-2">Type</h3>
            <div className="space-y-2">
              {['Architecture', 'Objects', 'Visual'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.type?.includes(type as ProjectType)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...(filters.type || []), type as ProjectType]
                        : filters.type?.filter((t) => t !== type)
                      updateFilters({ ...filters, type: newTypes })
                    }}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <h3 className="font-gt-america-mono text-sm mb-2">Role</h3>
            <div className="space-y-2">
              {['Design', 'Build', 'Manage'].map((role) => (
                <label key={role} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.role?.includes(role as ProjectRole)}
                    onChange={(e) => {
                      const newRoles = e.target.checked
                        ? [...(filters.role || []), role as ProjectRole]
                        : filters.role?.filter((r) => r !== role)
                      updateFilters({ ...filters, role: newRoles })
                    }}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <h3 className="font-gt-america-mono text-sm mb-2">Year</h3>
            <select
              value={filters.year || ''}
              onChange={(e) => updateFilters({ ...filters, year: parseInt(e.target.value) || undefined })}
              className="w-full border p-1"
            >
              <option value="">All Years</option>
              {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      {/* Projects List */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-quadrant text-4xl">Work</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsGridView(false)}
              className={`px-4 py-1 ${!isGridView ? 'bg-gray-200' : ''}`}
            >
              List
            </button>
            <button
              onClick={() => setIsGridView(true)}
              className={`px-4 py-1 ${isGridView ? 'bg-gray-200' : ''}`}
            >
              Grid
            </button>
          </div>
        </div>

        {isGridView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/work/${project.slug}`}
                className="group relative aspect-square overflow-hidden"
              >
                <img
                  src={project.cover}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <h3 className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-gt-america text-xl">
                    {project.name}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/work/${project.slug}`}
                className="block border-t py-4 group"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <h3 className="font-gt-america text-xl group-hover:underline">{project.name}</h3>
                    <p className="text-gray-600">{project.description_short}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-gt-america-mono">{project.role.join(', ')}</div>
                    <div className="text-gray-600">{project.year}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 