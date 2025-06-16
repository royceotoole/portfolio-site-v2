'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProjectType, ProjectRole } from '@/lib/supabase'

export default function AdminPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [projectData, setProjectData] = useState({
    slug: '',
    name: '',
    year: new Date().getFullYear(),
    company: 'Take Place',
    type: ['Architecture'],
    role: ['Design'],
    description_short: '',
    description_long: '',
    media: [] as string[],
    cover: '',
    importance: 1
  })

  const handleFileUpload = async () => {
    if (!files) return

    setUploading(true)
    const urls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('project-media')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading file:', error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-media')
        .getPublicUrl(fileName)

      urls.push(publicUrl)
    }

    setProjectData(prev => ({
      ...prev,
      media: [...prev.media, ...urls],
      cover: prev.cover || urls[0] || ''
    }))
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()

    if (error) {
      console.error('Error adding project:', error)
      alert('Error adding project')
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
      media: [],
      cover: '',
      importance: 1
    })
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Media Upload</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="mb-2"
            />
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={!files || uploading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {projectData.media.length > 0 && (
            <div>
              <label className="block mb-2">Uploaded Images</label>
              <div className="grid grid-cols-3 gap-4">
                {projectData.media.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Uploaded"
                    className="w-full h-32 object-cover"
                    onClick={() => setProjectData(prev => ({ ...prev, cover: url }))}
                    style={url === projectData.cover ? { border: '2px solid blue' } : {}}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Click an image to set it as cover</p>
            </div>
          )}

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
                    type="checkbox"
                    checked={projectData.type.includes(type as ProjectType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProjectData(prev => ({
                          ...prev,
                          type: [...prev.type, type as ProjectType]
                        }))
                      } else {
                        setProjectData(prev => ({
                          ...prev,
                          type: prev.type.filter(t => t !== type)
                        }))
                      }
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