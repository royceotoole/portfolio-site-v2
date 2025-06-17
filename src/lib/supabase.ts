import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

// Regular client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with elevated privileges (only created if service role key is available)
export const adminSupabase = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : supabase

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