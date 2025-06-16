'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ScreensaverPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    loadScreensaverImages()
  }, [])

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

  const handleFileUpload = async () => {
    if (!files) return

    setUploading(true)
    const urls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('screensaver')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading file:', error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('screensaver')
        .getPublicUrl(fileName)

      urls.push(publicUrl)
    }

    // Update the screensaver project with new images
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
        media: [...images, ...urls],
        cover: images[0] || urls[0] || '',
        importance: 1
      })

    if (error) {
      console.error('Error updating screensaver project:', error)
    } else {
      setImages(prev => [...prev, ...urls])
    }

    setUploading(false)
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
    } else {
      setImages(newImages)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Screensaver Images</h1>
      
      <div className="max-w-2xl">
        <div className="mb-8">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(e.target.files)}
            className="mb-2"
          />
          <button
            onClick={handleFileUpload}
            disabled={!files || uploading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt="Screensaver"
                className="w-full aspect-square object-cover"
              />
              <button
                onClick={() => handleRemoveImage(url)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 