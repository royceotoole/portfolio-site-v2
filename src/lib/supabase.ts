import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cmyyujlqxxiqgrnjaqqk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNteXl1amxxeHhpcWdybmphcXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDAwMzMsImV4cCI6MjA2NTY3NjAzM30.MDh4s52iPR3cYXJ2Icm_DCbLV8zV8OIxHEzkb71ZHh0'
// Add your service role key here - get it from Supabase dashboard > Settings > API
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''

// Regular client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with elevated privileges
export const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export type ProjectType = 'Architecture' | 'Objects' | 'Visual'
export type ProjectRole = 'Design' | 'Build' | 'Manage'
export type Company = 'Take Place' | 'Design-Built' | '5468796 Architecture' | 'Personal'

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
  cover: string
  importance: number
  created_at: string
  updated_at: string
} 