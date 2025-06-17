'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProjectType, ProjectRole } from '@/lib/supabase'

export default function AdminPage() {
  const [projectData, setProjectData] = useState({
    slug: '',
    name: '',
    year: new Date().getFullYear(),
    company: 'Take Place',
    type: ['Architecture'] as ProjectType[],
    role: ['Design'] as ProjectRole[],
    description_short: '',
    description_long: '',
    media: [''] as string[],  // Start with one empty URL field
    cover: '',
    importance: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Filter out empty URLs
      const filteredMedia = projectData.media.filter(url => url.trim() !== '')
      
      // Check if we have at least one valid URL
      if (filteredMedia.length === 0) {
        alert('Please add at least one media URL')
        return
      }

      // Make sure we have a cover image
      const dataToSubmit = {
        ...projectData,
        media: filteredMedia,
        cover: projectData.cover || filteredMedia[0]
      }

      // Insert the project
      const { data, error } = await supabase
        .from('projects')
        .insert([dataToSubmit])
        .select()

      if (error) {
        console.error('Error adding project:', error)
        alert(`Error adding project: ${error.message}`)
        return
      }

      alert('Project added successfully!')
      // Reset form
      setProjectData({
        slug: '',
        name: '',
        year: new Date().getFullYear(),
        company: 'Take Place',
        type: ['Architecture'] as ProjectType[],
        role: ['Design'] as ProjectRole[],
        description_short: '',
        description_long: '',
        media: [''],
        cover: '',
        importance: 1
      })
    } catch (error) {
      console.error('Error in form submission:', error)
      alert('Error adding project')
    }
  }

  const addMediaField = () => {
    if (projectData.media.length < 15) {
      setProjectData(prev => ({
        ...prev,
        media: [...prev.media, '']
      }))
    }
  }

  const removeMediaField = (index: number) => {
    setProjectData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
      cover: prev.cover === prev.media[index] ? '' : prev.cover
    }))
  }

  const updateMediaUrl = (index: number, url: string) => {
    setProjectData(prev => ({
      ...prev,
      media: prev.media.map((oldUrl, i) => i === index ? url : oldUrl)
    }))
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border p-4 rounded bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <label className="font-semibold">Media URLs</label>
              <button
                type="button"
                onClick={addMediaField}
                disabled={projectData.media.length >= 15}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300"
              >
                Add URL Field
              </button>
            </div>
            <div className="space-y-3">
              {projectData.media.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateMediaUrl(index, e.target.value)}
                    placeholder="Enter media URL"
                    className="flex-1 border p-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeMediaField(index)}
                    className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectData(prev => ({ ...prev, cover: url }))}
                    className={`px-3 rounded ${url === projectData.cover ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  >
                    Cover
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Add up to 15 media URLs. Click "Cover" to set as cover image.
            </p>
          </div>

          <div>
            <label className="block mb-2">Slug</label>
            <input
              type="text"
              value={projectData.slug}
              onChange={(e) => setProjectData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Year</label>
            <input
              type="number"
              value={projectData.year}
              onChange={(e) => setProjectData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Company</label>
            <select
              value={projectData.company}
              onChange={(e) => setProjectData(prev => ({ ...prev, company: e.target.value as any }))}
              className="w-full border p-2 rounded"
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
              className="w-full border p-2 rounded"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block mb-2">Long Description</label>
            <textarea
              value={projectData.description_long}
              onChange={(e) => setProjectData(prev => ({ ...prev, description_long: e.target.value }))}
              className="w-full border p-2 rounded"
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
              className="w-full border p-2 rounded"
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