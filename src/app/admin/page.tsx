'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProjectType, ProjectRole } from '@/lib/supabase'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      alert('Error logging in: ' + error.message)
    } else {
      setIsAuthenticated(true)
    }
  }

  const [projectData, setProjectData] = useState({
    slug: '',
    name: '',
    year: new Date().getFullYear(),
    company: 'Take Place',
    type: ['Architecture'] as ProjectType[],
    role: ['Design'] as ProjectRole[],
    description_short: '',
    description_long: '',
    media: [''] as string[],
    cover: '',
    importance: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filter out empty media URLs
    const filteredMedia = projectData.media.filter(url => url.trim() !== '')
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        media: filteredMedia,
        // If no cover is set, use the first media URL
        cover: projectData.cover || filteredMedia[0] || ''
      }])
      .select()

    if (error) {
      console.error('Error adding project:', error)
      alert('Error adding project: ' + error.message)
      return
    }

    alert('Project added successfully!')
    setProjectData({
      slug: '',
      name: '',
      year: new Date().getFullYear(),
      company: 'Take Place',
      type: ['Architecture'],
      role: ['Design'],
      description_short: '',
      description_long: '',
      media: [''],
      cover: '',
      importance: 1
    })
  }

  const handleMediaChange = (index: number, value: string) => {
    const newMedia = [...projectData.media]
    newMedia[index] = value
    
    // Add a new empty field if we're at the last field and it's not empty
    if (index === newMedia.length - 1 && value.trim() !== '' && newMedia.length < 15) {
      newMedia.push('')
    }
    
    // Remove empty fields except the last one
    const filteredMedia = newMedia.filter((url, i) => 
      url.trim() !== '' || i === newMedia.length - 1
    )
    
    setProjectData(prev => ({ ...prev, media: filteredMedia }))
  }

  const moveUrl = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    
    if (toIndex < 0 || toIndex >= projectData.media.length) return
    
    const newMedia = [...projectData.media]
    const [movedItem] = newMedia.splice(fromIndex, 1)
    newMedia.splice(toIndex, 0, movedItem)
    
    // If we moved the cover image, update its URL
    let newCover = projectData.cover
    if (projectData.cover === projectData.media[fromIndex]) {
      newCover = movedItem
    }
    
    setProjectData(prev => ({ ...prev, media: newMedia, cover: newCover }))
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
    return url.match(/\.(mp4|webm|ogg)$/i) != null
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
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Login
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
      
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Media URLs (up to 15)</label>
            <div className="space-y-4">
              {projectData.media.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleMediaChange(index, e.target.value)}
                      placeholder="https://..."
                      className="flex-1 border p-2"
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
                        className={`px-3 py-1 rounded ${
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
                    <div className={`relative w-[500px] h-[300px] bg-gray-100 rounded overflow-hidden ${
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
                        <video
                          src={url}
                          controls
                          className="w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLVideoElement).style.display = 'none'
                          }}
                        />
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

          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Add Project
          </button>
        </form>
      </div>
    </div>
  )
} 