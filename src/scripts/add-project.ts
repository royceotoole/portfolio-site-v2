import { supabase } from '../lib/supabase'
import type { ProjectType, ProjectRole } from '../lib/supabase'

interface ProjectInput {
  slug: string
  name: string
  year: number
  company: 'Take Place' | 'Design-Built' | '5468796 Architecture' | 'Personal'
  type: ProjectType[]
  role: ProjectRole[]
  description_short: string
  description_long: string
  media: string[]
  cover: string
  importance: number
}

async function addProject(project: ProjectInput) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()

  if (error) {
    console.error('Error adding project:', error)
    return null
  }

  return data[0]
}

// Example usage:
/*
const project = {
  slug: 'project-name',
  name: 'Project Name',
  year: 2024,
  company: 'Take Place',
  type: ['Architecture'],
  role: ['Design'],
  description_short: 'Short description',
  description_long: 'Detailed description...',
  media: ['https://...', 'https://...'],
  cover: 'https://...',
  importance: 1
}

addProject(project)
*/ 