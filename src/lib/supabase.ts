import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cmyyujlqxxiqgrnjaqqk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteXl1amxxeHhpcWdybmphcXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDAwMzMsImV4cCI6MjA2NTY3NjAzM30.MDh4s52iPR3cYXJ2Icm_DCbLV8zV8OIxHEzkb71ZHh0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
})

export type ProjectType = 'Architecture' | 'Objects' | 'Visual'
export type ProjectRole = 'Design' | 'Build' | 'Manage'
export type Company = 'Take Place' | 'Design-Built' | '5468796 Architecture' | 'Personal'

export interface MediaSettings {
  autoplay?: boolean
  start?: number
  end?: number
}

export interface Project {
  id: string
  slug: string
  name: string
  year: number
  company: Company
  type: ProjectType[]
  role: ProjectRole[]
  description_short: string
  description_long: string
  media: string[]
  media_settings: MediaSettings[]
  cover: string
  importance: number
  created_at: string
  updated_at: string
} 