'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ScreensaverPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
    loadScreensaverImages()
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

  const loadScreensaverImages = async () => {
    const { data: project } = await supabase
      .from('projects')
      .select('media')
      .eq('slug', 'screensaver')
      .single()

    if (project) {
      setImages(project.media)
    }
  }

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newImageUrl.trim()) return

    // Update the screensaver project with new image
    const { error } = await supabase
      .from('projects')
      .upsert({
        slug: 'screensaver',
        name: 'Screensaver',
        year: new Date().getFullYear(),
        company: 'Take Place',
        type: ['Architecture'],
        role: ['Design'],
        description_short: 'Landing page screensaver images',
        description_long: 'A collection of images used for the landing page screensaver.',
        media: [...images, newImageUrl],
        cover: images[0] || newImageUrl || '',
        importance: 1
      })

    if (error) {
      console.error('Error updating screensaver project:', error)
      alert('Error adding image: ' + error.message)
    } else {
      setImages(prev => [...prev, newImageUrl])
      setNewImageUrl('')
    }
  }

  const handleRemoveImage = async (urlToRemove: string) => {
    const newImages = images.filter(url => url !== urlToRemove)
    
    const { error } = await supabase
      .from('projects')
      .update({
        media: newImages,
        cover: newImages[0] || ''
      })
      .eq('slug', 'screensaver')

    if (error) {
      console.error('Error removing image:', error)
      alert('Error removing image: ' + error.message)
    } else {
      setImages(newImages)
    }
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
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
        <h1 className="text-3xl font-bold">Screensaver Images</h1>
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
        <form onSubmit={handleAddImage} className="mb-8 space-y-4">
          <div>
            <label className="block mb-2">Add Image URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 border p-2"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 whitespace-nowrap"
              >
                Add Image
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Add URLs from your Supabase screensaver bucket. Get the URLs by going to Storage {'>'} screensaver in your Supabase dashboard.
          </p>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url) => (
            <div key={url} className="relative group">
              {isValidUrl(url) && (
                <>
                  <img
                    src={url}
                    alt="Screensaver"
                    className="w-full aspect-square object-cover rounded"
                  />
                  <button
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 