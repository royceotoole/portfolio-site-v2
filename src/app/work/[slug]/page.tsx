import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'
import ProjectContent from './ProjectContent'

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!project) {
    return (
      <div className="w-full px-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-2">Project not found</p>
          <p className="text-sm text-gray-500">Redirecting back to projects...</p>
        </div>
      </div>
    )
  }

  return <ProjectContent project={project} />
} 