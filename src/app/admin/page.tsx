'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project, ProjectType, ProjectRole, Company, MediaSettings } from '@/lib/supabase'
import VideoPlayer from '@/components/VideoPlayer'
import Image from 'next/image'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectData, setProjectData] = useState<Omit<Project, 'id'>>({
    slug: '',
    name: '',
    type: ['Architecture'] as ProjectType[],
    role: [] as ProjectRole[],
    year: new Date().getFullYear(),
    company: 'Take Place' as Company,
    description_short: '',
    description_long: '',
    cover: '',
    media: [''],
    media_settings: [],
    importance: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    checkAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects()
    }
  }, [isAuthenticated])

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      setIsAuthenticated(!!session)
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Login error:', error)
      alert('Error logging in. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Filter out empty URLs before saving
      const filteredMedia = projectData.media.filter(url => url.trim() !== '')
      if (filteredMedia.length === 0) {
        alert('Please add at least one media URL')
        return
      }

      // Initialize media settings array if it doesn't exist
      let filteredSettings = projectData.media_settings || []
      
      // Filter settings to match filtered media
      filteredSettings = filteredSettings.filter((_, index) => 
        projectData.media[index].trim() !== ''
      )

      // Ensure each media item has a settings object with proper initialization
      while (filteredSettings.length < filteredMedia.length) {
        filteredSettings.push({
          autoplay: false,
          start: 0,
          end: undefined
        })
      }

      // Ensure each settings object has all required properties
      filteredSettings = filteredSettings.map((setting, index) => {
        const url = filteredMedia[index]
        const hasSubfolder = url.includes('/screensaver/') || url.includes('/project-media/')
        console.log(`Processing settings for media ${index}:`, {
          url,
          hasSubfolder,
          oldSettings: setting,
        })
        return {
          autoplay: setting?.autoplay ?? false,
          start: setting?.start ?? 0,
          end: setting?.end
        }
      })

      console.log('Final project data before save:', {
        mediaUrls: filteredMedia,
        settings: filteredSettings,
        mediaWithSettings: filteredMedia.map((url, i) => ({
          url,
          hasSubfolder: url.includes('/screensaver/') || url.includes('/project-media/'),
          settings: filteredSettings[i]
        }))
      })

      // Prepare project data for saving
      const updatedProjectData = {
        ...projectData,
        media: filteredMedia,
        media_settings: filteredSettings,
        updated_at: new Date().toISOString()
      }

      if (!updatedProjectData.cover) {
        updatedProjectData.cover = filteredMedia[0]
      }

      const { data, error } = editingProject 
        ? await supabase
            .from('projects')
            .update(updatedProjectData)
            .eq('slug', editingProject.slug)
            .select()
        : await supabase
            .from('projects')
            .insert([{
              ...updatedProjectData,
              created_at: new Date().toISOString()
            }])
            .select()

      if (error) throw error

      console.log('Project saved successfully. Response data:', data)
      console.log('Saved media settings:', data?.[0]?.media_settings)

      // Reset form and refresh projects
      setProjectData({
        slug: '',
        name: '',
        type: ['Architecture'] as ProjectType[],
        role: [] as ProjectRole[],
        year: new Date().getFullYear(),
        company: 'Take Place' as Company,
        description_short: '',
        description_long: '',
        cover: '',
        media: [''],
        media_settings: [],
        importance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setEditingProject(null)
      fetchProjects()
    } catch (error: any) {
      console.error('Error saving project:', error)
      const errorMessage = error.message || error.error_description || 'Unknown error occurred'
      alert(`Error saving project: ${errorMessage}`)
    }
  }

  const startEditing = (project: Project) => {
    // Initialize media settings if they don't exist
    const mediaSettings = project.media_settings || project.media.map(() => ({
      autoplay: false,
      start: 0,
      end: undefined
    }))

    // Ensure media settings array matches media array length
    while (mediaSettings.length < project.media.length) {
      mediaSettings.push({ autoplay: false, start: 0, end: undefined })
    }
    mediaSettings.length = project.media.length

    setEditingProject(project)
    setProjectData({
      slug: project.slug,
      name: project.name,
      type: project.type,
      role: project.role,
      year: project.year,
      company: project.company,
      description_short: project.description_short,
      description_long: project.description_long,
      cover: project.cover,
      media: [...project.media, ''], // Add an empty field at the end for new URLs
      media_settings: mediaSettings,
      importance: project.importance,
      created_at: project.created_at,
      updated_at: project.updated_at
    })
    // Scroll to form
    document.getElementById('projectForm')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleMediaChange = (index: number, value: string) => {
    const newMedia = [...projectData.media]
    newMedia[index] = value
    
    // Add a new empty field if we're at the last field and it's not empty
    if (index === newMedia.length - 1 && value.trim() !== '' && newMedia.length < 35) {
      newMedia.push('')
    }
    
    // Remove empty fields except the last one
    const filteredMedia = newMedia.filter((url, i) => 
      url.trim() !== '' || i === newMedia.length - 1
    )

    // Ensure media_settings array matches media array length
    const newSettings = [...(projectData.media_settings || [])]
    while (newSettings.length < filteredMedia.length) {
      newSettings.push({ autoplay: false, start: 0, end: undefined })
    }
    // Trim settings array to match media array
    newSettings.length = filteredMedia.length
    
    setProjectData(prev => ({ 
      ...prev, 
      media: filteredMedia,
      media_settings: newSettings
    }))
  }

  const handleMediaSettingChange = (index: number, setting: { autoplay?: boolean, start?: number, end?: number }) => {
    const newSettings = [...(projectData.media_settings || [])]
    // Initialize settings array if needed
    while (newSettings.length < projectData.media.length) {
      newSettings.push({ autoplay: false, start: 0, end: undefined })
    }
    // Update the specific setting
    newSettings[index] = { 
      autoplay: false, 
      start: 0, 
      end: undefined,
      ...newSettings[index],
      ...setting 
    }
    console.log(`Updating media settings for index ${index}:`, {
      url: projectData.media[index],
      oldSettings: projectData.media_settings?.[index],
      newSettings: newSettings[index],
      hasSubfolder: projectData.media[index].includes('/screensaver/') || projectData.media[index].includes('/project-media/')
    })
    setProjectData(prev => ({ ...prev, media_settings: newSettings }))
  }

  const moveUrl = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    
    if (toIndex < 0 || toIndex >= projectData.media.length) return
    
    const newMedia = [...projectData.media]
    const [movedItem] = newMedia.splice(fromIndex, 1)
    newMedia.splice(toIndex, 0, movedItem)
    
    // Move the settings along with the media
    const newSettings = [...(projectData.media_settings || [])]
    const [movedSettings] = newSettings.splice(fromIndex, 1)
    newSettings.splice(toIndex, 0, movedSettings)
    
    // If we moved the cover image, update its URL
    let newCover = projectData.cover
    if (projectData.cover === projectData.media[fromIndex]) {
      newCover = movedItem
    }
    
    setProjectData(prev => ({ 
      ...prev, 
      media: newMedia, 
      media_settings: newSettings,
      cover: newCover 
    }))
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isImageUrl = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null
  }

  const isVideoUrl = (url: string) => {
    return url?.match(/\.(mp4|webm|mov)$/i) !== null
  }

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('importance', { ascending: true })
      
      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('slug', slug)

    if (error) {
      alert('Error deleting project: ' + error.message)
    } else {
      fetchProjects()
    }
  }

  const renderMediaPreview = (url: string, index: number) => {
    if (!url) return null

    const settings = projectData.media_settings?.[index] || {}
    const isVideo = isVideoUrl(url)

    console.log(`Rendering media preview for index ${index}:`, {
      url,
      isVideo,
      settings,
      hasSubfolder: url.includes('/screensaver/') || url.includes('/project-media/')
    })

    return (
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {isVideo ? (
          <VideoPlayer
            src={url}
            autoplay={settings.autoplay}
            showTrimControls={projectData.name === "Screensaver"}
            initialStart={settings.start}
            initialEnd={settings.end}
            onTrimChange={(start, end) => {
              console.log(`Trim change for video ${index}:`, { url, start, end })
              handleMediaSettingChange(index, { start, end })
            }}
          />
        ) : (
          <Image
            src={url}
            alt={`Media preview ${index + 1}`}
            fill
            className="object-cover"
          />
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Login</h1>
        <form onSubmit={handleLogin} className="max-w-md space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => {
            supabase.auth.signOut()
            setIsAuthenticated(false)
          }}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Logout
        </button>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Existing Projects</h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.slug} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    {project.type.join(', ')} • {project.year} • Importance: {project.importance}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/work/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    View
                  </a>
                  <button
                    onClick={() => startEditing(project)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.slug)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">
          {editingProject ? `Edit Project: ${editingProject.name}` : 'Add New Project'}
        </h2>
        
        <form id="projectForm" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Media URLs (up to 35)</label>
            <div className="space-y-4">
              {projectData.media.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleMediaChange(index, e.target.value)}
                      placeholder="https://..."
                      className="flex-1 min-w-[200px] border p-2"
                    />
                    <div className="flex gap-1">
                      {index > 0 && index < projectData.media.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveUrl(index, 'up')}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          ↑
                        </button>
                      )}
                      {index < projectData.media.length - 2 && (
                        <button
                          type="button"
                          onClick={() => moveUrl(index, 'down')}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setProjectData(prev => ({ ...prev, cover: url }))}
                        className={`px-3 py-1 rounded whitespace-nowrap ${
                          projectData.cover === url 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200'
                        }`}
                      >
                        {projectData.cover === url ? 'Cover ✓' : 'Set as Cover'}
                      </button>
                    </div>
                  </div>
                  
                  {url && isValidUrl(url) && (
                    <div className={`relative w-full aspect-video bg-gray-100 rounded overflow-hidden ${
                      projectData.cover === url ? 'ring-2 ring-blue-500' : ''
                    }`}>
                      {isImageUrl(url) ? (
                        <img
                          src={url}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : isVideoUrl(url) ? (
                        <div className="relative w-full h-full">
                          <VideoPlayer
                            src={url}
                            autoplay={projectData.media_settings?.[index]?.autoplay}
                            showTrimControls={projectData.name === "Screensaver"}
                            initialStart={projectData.media_settings?.[index]?.start}
                            initialEnd={projectData.media_settings?.[index]?.end}
                            onTrimChange={(start, end) => handleMediaSettingChange(index, { start, end })}
                            className="w-full h-full"
                          />
                          {projectData.name === "Screensaver" && (
                            <div className="absolute top-2 right-2 flex gap-2">
                              <label className="flex items-center bg-black/50 text-white px-2 py-1 rounded text-sm">
                                <input
                                  type="checkbox"
                                  checked={projectData.media_settings?.[index]?.autoplay || false}
                                  onChange={(e) => handleMediaSettingChange(index, { autoplay: e.target.checked })}
                                  className="mr-2"
                                />
                                Autoplay
                              </label>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          Unsupported media type
                        </div>
                      )}
                      {projectData.cover === url && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                          Cover Image
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Add URLs for your media. The first URL will be used as the cover image if none is selected.
            </p>
          </div>

          <div>
            <label className="block mb-2">Slug</label>
            <input
              type="text"
              value={projectData.slug}
              onChange={(e) => setProjectData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full border p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Year</label>
            <input
              type="number"
              value={projectData.year}
              onChange={(e) => setProjectData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="w-full border p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Company</label>
            <select
              value={projectData.company}
              onChange={(e) => setProjectData(prev => ({ ...prev, company: e.target.value as any }))}
              className="w-full border p-2"
              required
            >
              <option>Take Place</option>
              <option>Design-Built</option>
              <option>5468796 Architecture</option>
              <option>Personal</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Type</label>
            <div className="space-y-2">
              {['Architecture', 'Objects', 'Visual'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    checked={projectData.type[0] === type}
                    onChange={() => {
                      setProjectData(prev => ({
                        ...prev,
                        type: [type as ProjectType]
                      }))
                    }}
                    className="mr-2"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2">Role</label>
            <div className="space-y-2">
              {['Design', 'Build', 'Manage'].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={projectData.role.includes(role as ProjectRole)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProjectData(prev => ({
                          ...prev,
                          role: [...prev.role, role as ProjectRole]
                        }))
                      } else {
                        setProjectData(prev => ({
                          ...prev,
                          role: prev.role.filter(r => r !== role)
                        }))
                      }
                    }}
                    className="mr-2"
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2">Short Description</label>
            <textarea
              value={projectData.description_short}
              onChange={(e) => setProjectData(prev => ({ ...prev, description_short: e.target.value }))}
              className="w-full border p-2"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block mb-2">Long Description</label>
            <textarea
              value={projectData.description_long}
              onChange={(e) => setProjectData(prev => ({ ...prev, description_long: e.target.value }))}
              className="w-full border p-2"
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block mb-2">Importance (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={projectData.importance}
              onChange={(e) => setProjectData(prev => ({ ...prev, importance: parseInt(e.target.value) }))}
              className="w-full border p-2"
              required
            />
          </div>

          <div className="flex gap-4 justify-end">
            {editingProject && (
              <button
                type="button"
                onClick={() => {
                  setEditingProject(null)
                  setProjectData({
                    slug: '',
                    name: '',
                    type: ['Architecture'] as ProjectType[],
                    role: [] as ProjectRole[],
                    year: new Date().getFullYear(),
                    company: 'Take Place' as Company,
                    description_short: '',
                    description_long: '',
                    cover: '',
                    media: [''],
                    media_settings: [],
                    importance: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              {editingProject ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 